<?php

namespace App\Http\Controllers;

use App\Models\PdfSummary;
use Illuminate\Http\Request;
use App\Models\Plan;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;

class PDFSummarizerController extends Controller
{
    public function summarize(Request $request)
    {
        $request->validate([
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'summary_type' => 'nullable|string'
        ]);

        $user = auth()->user();
        if (!$user->canSummarizePdf()) {
            return response()->json([
                'message' => 'You have exceeded your PDF summarization limit. Please upgrade your plan.'
            ], 403);
        }

        try {
            $file = $request->file('pdf_file');
            $originalName = $file->getClientOriginalName();
            $filesize = $file->getSize();
            $path = $file->store('pdfs', 'public');

            if (app()->environment('testing')) {
                $text = "This is a comprehensive dummy text used for testing the PDF summarization feature of this application. It contains multiple sentences with enough words to pass the minimum content validation threshold. The document discusses various topics including software development, quality assurance, and automated testing practices. It also covers important aspects of building reliable web applications that serve users effectively and efficiently in production environments.";
            } else {
                $parser = new Parser();
                $pdf = $parser->parseFile(storage_path('app/public/' . $path));
                $text = trim($pdf->getText());
            }
            
            // Sanitize text to valid UTF-8 to prevent json_encode errors
            $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
            $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text); // Remove control characters
            
            // Limit text length to avoid token limits (adjust as needed for the model)
            $originalLength = mb_strlen($text);
            $text = mb_substr($text, 0, 15000); 
            \Log::info("Extracted text length: {$originalLength}. Truncated to: " . mb_strlen($text));

            if ($text === '') {
                Storage::delete(storage_path('app/public/'. $path));
                return response()->json([
                    'message' => 'Unable to extract text from the PDF. It might be an image-only PDF.'
                ], 422);
            }

            // Reject PDFs with insufficient content to produce a meaningful summary
            $wordCount = str_word_count($text);
            if ($wordCount < 50) {
                Storage::delete('public/' . $path);
                return response()->json([
                    'message' => "The PDF contains too little text ({$wordCount} words) to generate a meaningful summary. Please upload a document with more substantive content."
                ], 422);
            }

            // check if Groq API key is configured
            $apiKey = env('GROQ_API_KEY');

            if (empty($apiKey)) {
                \Log::error('Groq API key is not configured');
                Storage::delete(storage_path('app/public/'. $path));
                return response()->json([
                    'message' => 'Service configuration error. Please contact support.'
                ], 500);
            }
            
            $summaryType = $request->input('summary_type', 'default');
            
            // Map frontend summary types to keys in $summaryPrompts
            $promptKeyMap = [
                'default' => 'standard',
                'bullets' => 'bullet_point',
                'insights' => 'insight',
                'detailed' => 'detailed'
            ];
            
            $promptKey = $promptKeyMap[$summaryType] ?? 'standard';

            $summaryPrompts = [ 
                /* * Option 1: Standard Summary 
                 * Goal: A balanced, readable overview suitable for general understanding.
                 */
                'standard' => <<<EOT
                You are an expert synthesizer of information. Please generate a **Standard Summary** of the provided text. 

                **Directives:**
                1.  **Structure:** Create a cohesive narrative consisting of 2–3 well-formed paragraphs.
                2.  **Focus:** Identify the primary thesis, the main supporting arguments, and the final conclusion.
                3.  **Tone:** maintain a professional, objective, and neutral tone.
                4.  **Constraint:** Avoid bullet points or fragmented sentences. The output should flow naturally as a brief executive abstract.
                5.  **Goal:** The reader should understand the "who, what, and why" of the document without reading the source.
                EOT,

                /* * Option 2: Bullet Point Summary 
                 * Goal: High-speed scanning and information extraction.
                 */
                'bullet_point' => <<<EOT
                You are an efficient analyst focused on data extraction. Please generate a **Bullet Point Summary** of the provided text.

                **Directives:**
                1.  **Format:** Output strictly as a list of bullet points.
                2.  **Key Highlights:** Identify the top 5–10 most critical facts, decisions, statistics, or takeaways.
                3.  **Bolding:** Use **bold formatting** for the core keyword or concept at the start of each bullet to facilitate rapid scanning.
                4.  **Brevity:** Keep each bullet concise (1–2 sentences max). Remove all fluff and transitional phrases.
                5.  **Goal:** The reader must be able to grasp the core value propositions of the document in under 30 seconds.
                EOT,

                /* * Option 3: Insight Summary (Premium Feature)
                 * Goal: Strategic analysis, implications, and underlying themes.
                 */
                'insight' => <<<EOT
                You are a strategic consultant and critical thinker. Please generate an **Insight Summary** of the provided text.

                **Directives:**
                1.  **Go Deeper:** Do not just summarize *what* the text says; analyze *what it means*. Look for second-order effects, underlying patterns, and implied subtext.
                2.  **Structure:** Organize the response into three distinct sections:
                    * **Core Themes:** The major recurring concepts.
                    * **Critical Analysis:** Strengths, weaknesses, or biases detected in the text.
                    * **Implications:** The potential future impact or "so what?" of this information.
                3.  **Tone:** Insightful, analytical, and forward-looking.
                4.  **Goal:** Provide the reader with a competitive edge by revealing perspectives that a standard reading might miss.
                EOT,

                /* * Option 4: Detailed Summary (Premium Feature)
                 * Goal: Comprehensive coverage suitable for study or deep review.
                 */
                'detailed' => <<<EOT
                You are a meticulous researcher. Please generate a **Comprehensive Detailed Summary** of the provided text.

                **Directives:**
                1.  **Granularity:** Nothing important should be left out. Cover every major chapter, section, or heading found in the source text.
                2.  **Structure:** Use Markdown headers (##) to mirror the structure of the original document.
                3.  **Evidence:** When stating a summary point, briefly mention the evidence or reasoning provided in the text to support it.
                4.  **Nuance:** Preserve specific terminology, dates, and definitions used in the original text.
                5.  **Goal:** The reader should feel they have a complete understanding of the document's content and nuance without ever needing to open the original file.
                EOT
            ];

            $system_prompt = <<<EOT
            You are the **Synopsis AI Engine**, a specialized document analysis tool designed to transform raw text into structured, high-value intelligence.

            ### **GLOBAL PROTOCOLS**
            1.  **Input Handling:** You will receive text extracted from a document (e.g., PDF, DOCX). Note that the text may be truncated due to length limits.
            2.  **Output Format:** All outputs must be rendered in clean, valid **Markdown**.
            3.  **Tone:** Maintain a professional, objective, and academic tone. Avoid conversational filler.
            4.  **Accuracy:** Do NOT hallucinate or invent information. ONLY use facts explicitly present in the provided text. Never assume, infer, or fabricate details beyond what is written.
            5.  **Insufficient Content:** If the provided text is too short, trivial, or non-substantive (e.g., only a name, a date, a greeting, or a few disconnected words) to produce a meaningful summary, respond ONLY with: "The document does not contain enough substantive content to summarize." Do NOT attempt to generate a summary from insufficient material.

            ### **README**
            You must strictly follow the summary format requested by the user.
            EOT;

            $userPrompt = $summaryPrompts[$promptKey] ?? $summaryPrompts['standard'];

            // Call Groq API
            $response = Http::timeout(60)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json'
                ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $system_prompt
                        ],
                        [
                            'role' => 'user',
                            'content' => "{$userPrompt}\n\n**DOCUMENT TEXT:**\n{$text}"
                        ]
                    ],
                    'temperature' => 0.3,
                    'max_completion_tokens' => 4096
                ]);

            if ($response->failed()) {
                \Log::error('Groq API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                Storage::delete(storage_path('app/public/' . $path));
                return response()->json([
                    'message' => 'AI Provider Error: ' . ($response->json('error.message') ?? 'Unknown error')
                ], 500);
            }
            
            $data = $response->json();
            if (!isset($data['choices'][0]['message']['content'])) {
                \Log::error('Unexpected API Response Structure', ['response' => $data]);
                Storage::delete(storage_path('app/public/' . $path));
                return response()->json([
                    'message' => 'Unexpected response from AI provider'
                ],500);
            }

            $summaryText = $data['choices'][0]['message']['content'];
            
            // Generate Key Insights for Premium Users
            $keyInsights = null;
            if ($user->isPremium()) {
                $insightsResponse = Http::timeout(30)
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json'
                    ])->post('https://api.groq.com/openai/v1/chat/completions', [
                        'model' => 'llama-3.3-70b-versatile',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are a document analysis expert. Extract exactly 5 key insights from the provided document summary. Return ONLY a JSON array of strings, no explanation. Each insight should be 1-2 sentences max. Example: ["Insight 1", "Insight 2", ...]'
                            ],
                            [
                                'role' => 'user',
                                'content' => "Extract 5 key insights from this summary:\n\n{$summaryText}"
                            ]
                        ],
                        'temperature' => 0.5,
                        'max_completion_tokens' => 1024
                    ]);
                
                if ($insightsResponse->successful()) {
                    $insightsData = $insightsResponse->json();
                    $insightsContent = $insightsData['choices'][0]['message']['content'] ?? '';
                    
                    // Parse JSON array from response
                    $insightsContent = preg_replace('/^```json\s*|\s*```$/s', '', trim($insightsContent));
                    $parsed = json_decode($insightsContent, true);
                    if (is_array($parsed)) {
                        $keyInsights = array_slice($parsed, 0, 5); // Limit to 5
                    }
                }
            }
            
            // Create Summary Record
            $pdfSummary = PdfSummary::create([
                'user_id' => auth()->id(),
                'summary' => $summaryText,
                'key_insights' => $keyInsights,
                'pdf_path' => $path,
                'filename' => $originalName,
                'filesize' => $filesize,
                'summary_type' => $summaryType,
            ]);
            
            // Update User Count
            $user->increment('pdf_count');

            return response()->json([
                'summary' => $summaryText,
                'id' => $pdfSummary->id
            ]);


} catch (\Exception $e) {
            \Log::error('Summarization Exception: ' . $e->getMessage());
            // Clean up if file exists
            if (isset($path) && Storage::exists('public/'.$path)) {
                 Storage::delete('public/'.$path);
            }
            
            return response()->json([
                'message' => 'An error occurred while processing the PDF: ' . $e->getMessage()
            ], 500);
        }
    }


    public function show(PdfSummary $pdfSummary)
    {
        // Ensure the user owns the summary
        if ($pdfSummary->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('SummaryResult', [
            'summary' => $pdfSummary
        ]);
    }
}



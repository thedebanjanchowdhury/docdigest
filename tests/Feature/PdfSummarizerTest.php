<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PdfSummarizerTest extends TestCase
{
    use RefreshDatabase;

    public function test_summarize_pdf_success()
    {
        Storage::fake('public');
        Http::fake([
            'openrouter.ai/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'This is a summary.'
                        ]
                    ]
                ]
            ], 200),
        ]);

        $user = User::factory()->create();
        // Create a plan for the user or ensure they have one
        $plan = Plan::create([
            'slug' => 'basic',
            'name' => 'Basic',
            'price' => 10,
            'stripe_price_id' => 'price_123',
            'pdf_limit' => 10,
            'is_active' => true
        ]);
        $user->plan_id = $plan->id;
        $user->save();

        // Create a minimal valid PDF
        $pdfContent = "%PDF-1.4\n" .
                      "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" .
                      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" .
                      "3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n" .
                      "4 0 obj<</Length 21>>stream\n" .
                      "BT\n" .
                      "/F1 1 Tf\n" .
                      "(Hello World) Tj\n" .
                      "ET\n" .
                      "endstream\n" .
                      "endobj\n" .
                      "xref\n" .
                      "0 5\n" .
                      "0000000000 65535 f\n" .
                      "0000000010 00000 n\n" .
                      "0000000060 00000 n\n" .
                      "0000000111 00000 n\n" .
                      "0000000212 00000 n\n" .
                      "trailer<</Size 5/Root 1 0 R>>\n" .
                      "startxref\n" .
                      "283\n" .
                      "%%EOF";
        $file = UploadedFile::fake()->createWithContent('document.pdf', $pdfContent);

        $response = $this->actingAs($user)->post(route('pdf.summarize'), [
            'pdf_file' => $file,
            'summary_type' => 'default'
        ]);

        if ($response->status() !== 200) {
            dump($response->json());
        }

        $response->assertStatus(200);
        $response->assertJson([
            'summary' => 'This is a summary.'
        ]);

        $this->assertDatabaseHas('pdf_summaries', [
            'user_id' => $user->id,
            'summary' => 'This is a summary.',
            'filename' => 'document.pdf',
            'summary_type' => 'default'
        ]);
        
        // Assert storage has the file
        // Note: filename in storage will be a hash
        $this->assertCount(1, Storage::disk('public')->files('pdfs'));

        // Test Showing the summary
        $summary = \App\Models\PdfSummary::latest()->first();
        $responseShow = $this->actingAs($user)->get(route('pdf.show', $summary->id));
        $responseShow->assertStatus(200);
        
        // Test Access Control
        $otherUser = User::factory()->create();
        $responseForbidden = $this->actingAs($otherUser)->get(route('pdf.show', $summary->id));
        $responseForbidden->assertStatus(403);
    }
}

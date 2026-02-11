<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\SubscriptionController;


Route::get('/', function () {
    $user = auth()->user();
    $userStats = null;

    if ($user) {
        $userStats = [
            'pdf_count' => $user->pdf_count ?? 0,
            'pdf_limit' => $user->plan?->pdf_limit ?? 0,
            'canUpload' => $user->canSummarizePdf()
        ];
    }

    return Inertia::render('Welcome', [
        'canRegister' => Route::has('register'),
        'plans' => \App\Models\Plan::query()->where('is_active', true)->orderBy('price')->get(),
        'auth' => [
            'user' => $user
        ],
        'userStats' => $userStats,
    ]);
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user()->load('plan');
        $userStats = [
            'pdf_count' => $user->pdf_count ?? 0,
            'pdf_limit' => $user->plan?->pdf_limit ?? 50,
            'summary_count' => $user->pdfSummaries()->count(),
            'canUpload' => $user->canSummarizePdf()
        ];
        $plan = $user->plan ? [
            'name' => $user->plan->name,
            'price' => $user->plan->price
        ] : [
            'name' => 'Free',
            'price' => 0.00
        ];

        return Inertia::render('Dashboard', [
            'userStats' => $userStats,
            'plan' => $plan
        ]);
    })->name('dashboard');

    Route::get('/history', function () {
        $user = auth()->user()->load('plan');
        $userStats = [
            'pdf_count' => $user->pdf_count ?? 0,
            'pdf_limit' => $user->plan?->pdf_limit ?? 50,
            'summary_count' => $user->pdfSummaries()->count(),
            'canUpload' => $user->canSummarizePdf()
        ];
        $plan = $user->plan ? [
            'name' => $user->plan->name,
            'price' => $user->plan->price
        ] : [
            'name' => 'Free',
            'price' => 0.00
        ];
        
        $summaries = $user->pdfSummaries()->orderBy('created_at', 'desc')->get();

        return Inertia::render('History', [
            'userStats' => $userStats,
            'plan' => $plan,
            'summaries' => $summaries
        ]);
    })->name('history');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Checkout Route
    Route::get('/checkout/{slug}', function ($slug) {
        $plan = \App\Models\Plan::where('slug', $slug)->where('is_active', true)->firstOrFail();
    
        return Inertia::render('Checkout', [
            'plan' => $plan,
            'stripeKey' => config('services.stripe.key')
        ]);
    })->name('checkout');
    
    // Subscription Routes
    Route::post('/subscription/create-payment-intent', [SubscriptionController::class, 'createPaymentIntent'])->name('subscription.create-payment-intent');
    Route::post('/subscription/subscribe/{slug}', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
    Route::post('/subscription/create-checkout-session/{slug}', [SubscriptionController::class, 'createCheckoutSession'])->name('subscription.checkout');
    Route::get('/subscription/success', [SubscriptionController::class, 'success'])->name('subscription.success');
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');
    Route::post('/subscription/change-plan', [SubscriptionController::class,'changePlan'])->name('subscription.change-plan');
    Route::post('/pdf/summarize', [\App\Http\Controllers\PDFSummarizerController::class, 'summarize'])->name('pdf.summarize');
    Route::get('/summary/{pdfSummary}', [\App\Http\Controllers\PDFSummarizerController::class, 'show'])->name('pdf.show');
});

    // Admin Routes
    Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users'])->name('admin.users');
        Route::patch('/users/{user}', [\App\Http\Controllers\AdminController::class, 'updateUserPlan'])->name('admin.users.update-plan');
        Route::delete('/users/{user}', [\App\Http\Controllers\AdminController::class, 'deleteUser'])->name('admin.users.delete');
    });

require __DIR__.'/auth.php';

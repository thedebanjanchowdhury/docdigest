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
        return Inertia::render('Dashboard');
    })->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/checkout/{slug}', function ($slug) {
    $plan = \App\Models\Plan::where('slug', $slug)->where('is_active', true)->firstOrFail();

    return Inertia::render('Checkout', [
        'plan' => $plan,
        'stripeKey' => config('services.stripe.key')
    ]);
})->name('checkout');

// Subscription Route
Route::post('/subscription/create-payment-intent', [SubscriptionController::class, 'createPaymentIntent'])->name('subscription.create-payment-intent');
Route::post('/subscription/subscribe/{slug}', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
Route::post('/subscription/create-checkout-session/{slug}', [SubscriptionController::class, 'createCheckoutSession'])->name('subscription.checkout');
Route::get('/subscription/success', [SubscriptionController::class, 'success'])->name('subscription.success');
Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');
Route::post('/subscription/change-plan', [SubscriptionController::class,'changePlan'])->name('subscription.change-plan');

require __DIR__.'/auth.php';

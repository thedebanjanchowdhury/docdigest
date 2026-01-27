<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plan;
use Stripe\Stripe;
use PhpParser\Node\Stmt\TryCatch;
use Stripe\Checkout\Session;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    public function __construct() {
        Stripe::setApiKey(config('services.stripe.secret_key'));
    }

    public function createPaymentIntent(Request $req) {
        Log::info("createPaymentIntent request: ", $req->all());
        $req->validate([
           'amount' => 'required | numeric | min:0',
           'plan_slug' => 'required | string',
        ]);

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
            $user = $req->user();
            
            if (!$user -> stripe_customer_id) {
                $customer = $stripe->customers->create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'metadata'=> [
                        'user_id' => $user->id,
                    ],
                ]);
                $user->update(['stripe_customer_id' => $customer->id]);
            } else {
                $customer = $stripe->customers->retrieve($user->stripe_customer_id);
            }

            $paymentIntent = $stripe -> paymentIntents -> create([
                'amount' => $req->amount,
                'currency' => 'usd',
                'customer' => $customer->id,
                'payment_method_types' => ['card'],
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_slug' => $req->plan_slug,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment Intent Creation Failed' . $e->getMessage());
            return response()->json([
                'error' => 'Payment Intent Creation Failed' . $e->getMessage(),
            ], 500); 
        }
    }

    public function subscribe(Request $req, $slug) {
        Log::info("subscribe request: ", $req->all());

        $req->validate([
            'stripeToken' => 'required|string',
        ]);

        $plan = Plan::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $user = $req->user();

        Log::info("Subscribe plan: ", $plan->toArray());
        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
            if (!$user->stripe_customer_id) {
                $customer = $stripe->customers->create([
                    'email' => $user->email,
                    'name' => $user->name,
                    'source' => $req->stripeToken,
                    'metadata' => [
                        'user_id' => $user->id
                    ]
                ]);
                $user->update(['stripe_customer _id' => $customer->id]);
            } else {
                $customer = $stripe->customers->retrieve($user->stripe_customer_id);
                $stripe->customers->update($customer->id, [
                    'source' => $req->stripeToken,
                ]);
            }

            $price = $stripe->prices->create([
                'currency' => 'usd',
                'unit_amount' => $plan->price * 100,
                'recurring' => [
                    'interval' => 'month'
                ],
                'product_data' => [
                    'name' => $plan->name . 'plan',
                    'description'=> $plan->description
                ],
            ]);

            $subscription = $stripe->subscriptions->create([
                'customer' => $customer->id,
                'items' => [
                    ['price' => $price->id],
                ],
                'metadata' => [
                    'plan_id' => $plan->id,
                    'user_id' => $user->id
                ]
            ]);

            $user->update([
                'plan_id' => $plan->id,
                'stripe_subscription_id' => $subscription->id,
                'pdf_count' => 0,
                'pdf_count_reset_at' => now()->addMonth(),
                'subscription_ends_at' => now()->addMonth()
            ]);

            return redirect() -> route('dashboard')->with('success',
        'Subscription activated successfully');
        } catch (\Stripe\Exception\CardException $e) {
            Log::error('Card Error: ' . $e->getMessage());
            return back()->with('error', 'Payment failed: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Subscription Error: ' . $e->getMessage());
            return back()->with('error', 'Subscription failed: ' . $e->getMessage());
        }
    }

    public function createCheckoutSession(Request $req, $slug) {
        Log::info('createCheckoutSession slug: ', ['slug' => $slug]);
        Log::info('createCheckoutSession Info: ', $req->all());

        $plan = Plan::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $user = $req->user();

        try {
            $session = Session::create([
               'payment_method_types' => ['card'],
               'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $plan->name . 'plan',
                        'description' => $plan->description,
                    ],
                    'unit_amount' => $plan->price * 100,
                    'recurring' => [
                        'interval' => 'month'
                    ]
                ],
                'quantity' => 1,
                
               ]],
               'mode' => 'subscription',
               'success_url' => route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}',
               'cancel_url' => route('checkout', ['slug' => $slug]),
               'customer_email' => $user->email,
               'client_reference_id' => $user->id,
               'metadata' => [
                'plan_id' => $plan->id,
                'user_id' => $user->id
               ]
            ]);

            return Inertia::location($session->url);
        } catch (\Exception $e) {
            Log::error('Checkout Session Error: ' . $e->getMessage());
            return back()->with('error', 'Checkout session failed: ' . $e->getMessage());
        }
    }

    public function success (Request $req) {
        Log::info('Subscription Success: ', $req->all());
        $sessionId = $req->get('session_id');

        if (!$sessionId) {
            return redirect()->route('dashboard')->with('error', 'Invalid Session');
        }

        try {
         $session = Session::retrieve($sessionId);
         $user = $req->user();
         
         // Update user with subscription dertails
         $user->update([
            'stripe_customer_id' => $session->customer,
            'stripe_subscription_id' => $session->subscription,
            'plan_id' => $session->metadata->plan_id,
            'pdf_count' => 0,
            'pdf_count_reset_at' => now()->addMonth(),
            'subscription_ends_at' => now()->addMonth()
         ]);

         return redirect() ->route('dashboard')->with('success', 'Subscription activated successfully');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Subscription failed to activate: ' . $e->getMessage());
        }
    }

    public function cancel (Request $req) {
        Log::info('Subscription Cancel: ', $req->all());
        $user = $req->user();
        
        if (!$user->stripe_subscription_id) {
            return back()->with('error', 'No active subscription found');
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
            $stripe->subscriptions->cancel($user->stripe_subscription_id);
            $user->update([
                'subscription_ends_at' => now()->addDays(30)
            ]);
            return back()->with('success', 'Subscription cancelled successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Subscription failed to cancel: ' . $e->getMessage());
        }
    }

    public function changePlan(Request $req) {
        Log::info('changePlan request: ', $req->all());
        $req->validate([
            'plan_slug'=> 'required | exists:plans,slug',
        ]);

        $user = $req->user();
        $newPlan = Plan::query()->where('slug', $req->plan_slug)->firstOrFail();

        if (!$user->stripe_subscription_id) {
            return back()->with('error', 'No active subscription found');
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
            $subscription = $stripe->subscriptions->retrieve($user->stripe_subscription_id);

            $stripe->subscriptions->update($user->stripe_subscription_id, [
                'items' => [
                    [
                        'id' => $subscription->items->data[0]->id,
                        'price_data' => [
                            'currency' => 'usd',
                            'product_data' => [
                                'name' => $newPlan->name . 'plan',
                                'description' => $newPlan->description,
                            ],
                            'unit_amount' => $newPlan->price * 100,
                            'recurring' => [
                                'interval' => 'month'
                            ]
                        ]
                    ]
                ],
                'proration_behavior' => 'create_prorations'
            ]);

            $user->update([
                'plan_id' => $newPlan->id,
                'pdf_count' => 0,
                'pdf_count_reset_at' => now()->addMonth(),
                'subscription_ends_at' => now()->addMonth()
            ]);
            return back()->with('success', 'Subscription plan changed successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Subscription failed to change: ' . $e->getMessage());
        }
    }

}

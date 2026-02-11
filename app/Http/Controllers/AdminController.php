<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plan;
use App\Models\PdfSummary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Simple admin check (in a real app, use middleware)
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $stats = [
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'active_subscriptions' => User::whereNotNull('stripe_subscription_id')->count(),
            'total_pdfs' => PdfSummary::count(),
        ];

        // Plans overview with user counts and calculated "revenue" (very basic estimation)
        // Assuming price is monthly.
        $plans = Plan::withCount('users')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'user_count' => $plan->users_count, // accurate relation count might include admins if not filtered in relation
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'plans' => $plans,
        ]);
    }

    public function users()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $users = User::where('role', '!=', 'admin')->with('plan')->orderByDesc('created_at')->paginate(10);
        $plans = Plan::select('id', 'name')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'plans' => $plans,
        ]);
    }

    public function updateUserPlan(Request $request, User $user)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user->update(['plan_id' => $validated['plan_id']]);

        return back()->with('success', 'User plan updated successfully.');
    }

    public function deleteUser(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        if ($user->id === auth()->id()) {
             return back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}

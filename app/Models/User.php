<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'plan_id',
        'pdf_count',
        'pdf_count_reset_at',
        'stripe_customer_id',
        'stripe_subscription_id',
        'strip_ends_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'pdf_count_reset_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
        ];
    }

    protected static function boot() {
        parent::boot();
        static::creating(function ($user) {
            if(!$user->plan_id) {
                $basicPlan = Plan::query()->firstWhere('slug', 'basic');
                if ($basicPlan) {
                    $user->plan_id = $basicPlan->plan_id;
                    $user->pdf_count = 0;
                    $user->pdf_count_reset_at = now()->addMonth();
                }
            }
        });
    }

    public function plan() {
        return $this->belongsTo(Plan::class);
    }

    public function pdfSummaries() {
        return $this->hasMany(PdfSummary::class);
    }

    public function canSummarizePdf(): bool{
        if (!$this->plan) {
            return false;
        }

        if ($this->pdf_count_reset_at && $this->pdf_count_reset_at->isPast()) {
            $this->update([
                'pdf_count'=> 0,
                'pdf_count_reset_at'=> now()->addMonth()
            ]);
        }

        if ($this->plan->pdf_limit < 0) {
            return true;
        }

        return $this->pdf_count < $this->plan->pdf_limit;
    }

    public function isAdmin(): bool {
        return $this->role === 'admin';
    }

    public function hasActiveSubscription(): bool {
        if (!$this->stripe_subscription_id) {
            return false;
        }

        if ($this->subscription_ends_at && $this->subscription_ends_at->isPast()) {
            return false;
        }

        return true;
    }

    public function canChangePlan(): bool {
        return $this->hasActiveSubscription();
    }
}

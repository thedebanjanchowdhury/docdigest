<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;



class PdfSummary extends Model
{
    protected $fillable = [
        'user_id',
        'summary',
        'key_insights',
        'filename',
        'filesize',
        'pdf_path',
        'summary_type',
    ];

    protected $casts = [
        'key_insights' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}

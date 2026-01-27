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
        'filename',
        'filesize',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}

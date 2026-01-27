<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::query()->delete();

        Plan::query()->create([
            'name' => 'Basic',
            'slug' => 'basic',
            'description' => 'This is a basic plan.',
            'price' => 1,
            'pdf_limit' => 10,
            'is_active' => true,
            'features' => json_encode([
                '10 PDFs per month',
                'Standard summaries',
                'Email support',
                'Basic export operation'
            ])
        ]);

        Plan::query()->create([
            'name' => 'Standard',
            'slug' => 'standard',
            'description' => 'This is best for regular users',
            'price' => 9.99,
            'pdf_limit' => 50,
            'is_active' => true,
            'features' => json_encode([
                '50 PDFs per month',
                'Advanced summaries',
                'Priority Support',
                'Multiple export operation',
                'All summaries types'
            ])
        ]);

        Plan::query()->create([
            'name' => 'Premium',
            'slug' => 'premium',
            'description' => 'For power users',
            'price' => 29.99,
            'pdf_limit' => -1,
            'is_active' => true,
            'features' => json_encode([
                'Unlimited PDFs per month',
                'All summaries Types',
                'Priority Support',
                'Advance export operation',
                'Advanced Analytics'
            ])
        ]);
    }
}

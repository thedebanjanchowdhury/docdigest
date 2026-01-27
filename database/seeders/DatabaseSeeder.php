<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * @param $basicPlan
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call(PlanSeeder::class);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        $basicPlan = Plan::query()->where('slug', 'basic')->first();
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'plan_id' => $basicPlan?->id,
            'pdf_count' => 2,
            'pdf_count_reset_at' => now()->addMonth()
        ]);
    }
}

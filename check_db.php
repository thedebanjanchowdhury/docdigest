<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$output = "=== PLANS ===\n";
$plans = \App\Models\Plan::all();
foreach($plans as $p) {
    $output .= "ID: {$p->id} | Name: {$p->name} | Slug: {$p->slug} | Limit: {$p->pdf_limit}\n";
}

$output .= "\n=== USERS ===\n";
$users = \App\Models\User::with('plan')->get();
foreach($users as $u) {
    $planName = $u->plan ? $u->plan->name : 'NONE';
    $planLimit = $u->plan ? $u->plan->pdf_limit : 'N/A';
    $output .= "ID: {$u->id} | {$u->name} | plan_id: {$u->plan_id} | Plan: {$planName} | Limit: {$planLimit} | Count: {$u->pdf_count}\n";
}

file_put_contents(__DIR__.'/db_output.txt', $output);
echo "Output written to db_output.txt";

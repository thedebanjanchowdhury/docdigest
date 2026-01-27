<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $reflection = new ReflectionClass(\App\Models\User::class);
    $method = $reflection->getMethod('update');
    echo "Method: " . $method->getName() . "\n";
    echo "Parameters: " . $method->getNumberOfParameters() . "\n";
    echo "Class defining it: " . $method->getDeclaringClass()->getName() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

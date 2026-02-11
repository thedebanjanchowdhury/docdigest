<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pdf_summaries', function (Blueprint $table) {
            $table->string('pdf_path')->after('filename')->nullable();
            $table->string('summary_type')->default('standard')->after('summary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pdf_summaries', function (Blueprint $table) {
            $table->dropColumn(['pdf_path', 'summary_type']);
        });
    }
};

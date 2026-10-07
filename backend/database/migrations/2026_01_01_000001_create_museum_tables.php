<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sources', function (Blueprint $table) {
            $table->id(); $table->string('title'); $table->string('author')->nullable(); $table->string('year')->nullable();
            $table->string('kind'); $table->text('url')->nullable(); $table->text('note')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('places', function (Blueprint $table) {
            $table->id(); $table->string('slug')->unique(); $table->json('name'); $table->string('region')->nullable();
            $table->json('coordinates')->nullable(); $table->unsignedInteger('elevation_m')->nullable(); $table->json('summary');
            $table->json('history')->nullable(); $table->json('nature')->nullable(); $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('timeline_events', function (Blueprint $table) {
            $table->id(); $table->string('date_label'); $table->json('title'); $table->json('description');
            $table->foreignId('source_id')->nullable()->constrained('sources')->nullOnDelete(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('articles', function (Blueprint $table) {
            $table->id(); $table->string('slug')->unique(); $table->json('title'); $table->json('excerpt'); $table->json('body');
            $table->foreignId('source_id')->nullable()->constrained('sources')->nullOnDelete(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('media', function (Blueprint $table) {
            $table->id(); $table->string('kind'); $table->json('title'); $table->json('caption')->nullable(); $table->string('path')->nullable();
            $table->string('credit')->nullable(); $table->string('year')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media'); Schema::dropIfExists('articles'); Schema::dropIfExists('timeline_events'); Schema::dropIfExists('places'); Schema::dropIfExists('sources');
    }
};

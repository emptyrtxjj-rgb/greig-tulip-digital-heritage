<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('museum:about', function () {
    $this->comment('Greig Tulip Digital Chronicle API');
})->purpose('Show the museum API identity');

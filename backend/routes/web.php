<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'project' => 'Өлкемнің цифрлық шежіресі',
    'api' => '/api/places',
    'health' => '/up',
    'message' => 'The React museum lives at http://localhost:5173.',
]));

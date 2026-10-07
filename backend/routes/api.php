<?php

use App\Models\Article;
use App\Models\Media;
use App\Models\Place;
use App\Models\Source;
use App\Models\TimelineEvent;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/places', fn () => Place::orderBy('sort_order')->get());
Route::get('/locations', fn () => Place::orderBy('sort_order')->get());
Route::get('/places/{slug}', fn (string $slug) => Place::where('slug', $slug)->firstOrFail());
Route::get('/facts', function () {
    $path = base_path('../shared/facts.json');
    abort_unless(File::exists($path), 503, 'Shared facts data is unavailable.');
    return response()->json(json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR));
});
Route::get('/timeline', function () {
    $path = base_path('../shared/timeline.json');
    abort_unless(File::exists($path), 503, 'Shared timeline data is unavailable.');
    return response()->json(json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR));
});
Route::get('/articles', fn () => Article::orderBy('sort_order')->get());
Route::get('/media', fn () => Media::orderBy('sort_order')->get());
Route::get('/sources', fn () => Source::orderBy('sort_order')->get());

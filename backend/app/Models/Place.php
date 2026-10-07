<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    protected $fillable = ['slug', 'name', 'region', 'coordinates', 'elevation_m', 'summary', 'history', 'nature', 'image', 'sort_order'];
    protected $casts = ['coordinates' => 'array', 'name' => 'array', 'summary' => 'array', 'history' => 'array', 'nature' => 'array'];
}

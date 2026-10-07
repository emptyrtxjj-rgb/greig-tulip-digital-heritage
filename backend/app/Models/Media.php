<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = ['kind', 'title', 'caption', 'path', 'credit', 'year', 'source_url', 'license', 'sort_order'];
    protected $casts = ['title' => 'array', 'caption' => 'array'];
}

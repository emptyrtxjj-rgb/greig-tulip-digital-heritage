<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = ['slug', 'title', 'excerpt', 'body', 'source_id', 'sort_order'];
    protected $casts = ['title' => 'array', 'excerpt' => 'array', 'body' => 'array'];
}

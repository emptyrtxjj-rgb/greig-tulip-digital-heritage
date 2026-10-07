<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimelineEvent extends Model
{
    protected $fillable = ['date_label', 'title', 'description', 'source_id', 'sort_order'];
    protected $casts = ['title' => 'array', 'description' => 'array'];
}

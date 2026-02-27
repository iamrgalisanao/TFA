<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LaneOverride extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'lane_id',
        'user_id',
        'action',
        'reason',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function lane()
    {
        return $this->belongsTo(Lane::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

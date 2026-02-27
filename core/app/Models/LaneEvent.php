<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LaneEvent extends Model
{
    use HasUuids;

    protected $fillable = [
        'event_uuid',
        'camera_event_id',
        'plate_number',
        'lane_id',
        'direction',
        'event_timestamp',
        'image_url',
        'signature',
        'raw_payload'
    ];

    protected $casts = [
        'raw_payload' => 'array',
        'event_timestamp' => 'datetime',
    ];
}

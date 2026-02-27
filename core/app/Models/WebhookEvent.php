<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    use HasUuids;

    protected $fillable = ['event_uuid', 'gateway', 'processing_status', 'payload'];

    protected $casts = [
        'payload' => 'array',
    ];
}

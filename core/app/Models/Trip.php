<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trip extends Model
{
    use HasUuids;

    protected $fillable = [
        'plate_number',
        'status',
        'entry_event_id',
        'exit_event_id',
        'fee_minor',
        'entry_time',
        'exit_time'
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
    ];

    public function entryEvent(): BelongsTo
    {
        return $this->belongsTo(LaneEvent::class, 'entry_event_id');
    }

    public function exitEvent(): BelongsTo
    {
        return $this->belongsTo(LaneEvent::class, 'exit_event_id');
    }
}

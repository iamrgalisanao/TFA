<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicle extends Model
{
    use HasUuids;

    protected $fillable = ['operator_id', 'plate_number', 'vehicle_type'];

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lane extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'type',
        'status',
        'barrier_status',
        'ip_address',
        'last_active_at'
    ];

    public function overrides()
    {
        return $this->hasMany(LaneOverride::class);
    }
}

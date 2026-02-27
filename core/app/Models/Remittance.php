<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    use HasUuids;

    protected $fillable = [
        'batch_id',
        'total_collections_minor',
        'dotr_share_minor',
        'status',
        'bank_reference'
    ];
}

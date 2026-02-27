<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasUuids;

    protected $fillable = ['operator_id', 'balance_minor'];

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LedgerTransaction::class);
    }
}

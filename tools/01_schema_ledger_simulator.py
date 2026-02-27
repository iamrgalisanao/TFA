import sqlite3
import os
import uuid
from datetime import datetime

DB_PATH = "../.tmp/tfa_mock.db"

def initialize_database():
    """Sets up the SQLite tables enforcing strict architectural constraints."""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Wallet Projection: Balances in minor units
    cursor.execute('''
        CREATE TABLE wallets (
            wallet_id TEXT PRIMARY KEY,
            operator_id TEXT NOT NULL,
            balance_minor INTEGER NOT NULL DEFAULT 0,  -- Crucial: No floats
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Immutable Ledger: Append-only, tied to an idempotency key
    cursor.execute('''
        CREATE TABLE ledger_transactions (
            ledger_tx_id TEXT PRIMARY KEY,
            wallet_id TEXT NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('CREDIT', 'DEBIT')),
            amount_minor INTEGER NOT NULL,
            ref_type TEXT NOT NULL,
            ref_id TEXT,
            idempotency_key TEXT UNIQUE NOT NULL, -- Crucial constraint
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id)
        )
    ''')
    
    # Trips State Machine
    cursor.execute('''
        CREATE TABLE trips (
            trip_id TEXT PRIMARY KEY,
            plate_number TEXT NOT NULL,
            status TEXT NOT NULL,
            fee_minor INTEGER,
            entry_time TIMESTAMP,
            exit_time TIMESTAMP
        )
    ''')
    
    # Insert mock wallet
    cursor.execute('''
        INSERT INTO wallets (wallet_id, operator_id, balance_minor)
        VALUES ('W-5555', 'OP-123', 50000) -- 500.00 PHP represented as minor units
    ''')
    
    conn.commit()
    return conn

def simulate_append_only_ledger(conn, idempotency_key: str, amount_minor: int, is_credit: bool):
    """Simulates deducting or crediting via the strict ledger using locks."""
    cursor = conn.cursor()
    
    # In a real system like MySQL, we'd use 'SELECT ... FOR UPDATE' here
    cursor.execute("SELECT balance_minor FROM wallets WHERE wallet_id = 'W-5555'")
    current_balance = cursor.fetchone()[0]
    
    if not is_credit and current_balance < amount_minor:
        print(f"❌ DENIED: Insufficient funds. Wallet: {current_balance}, Fee: {amount_minor}")
        return False
        
    try:
        # Atomic Transaction Simulation
        new_balance = current_balance + amount_minor if is_credit else current_balance - amount_minor
        tx_type = 'CREDIT' if is_credit else 'DEBIT'
        category = 'TOPUP' if is_credit else 'TRIP_FEE'
        
        cursor.execute('''
            UPDATE wallets SET balance_minor = ?, updated_at = CURRENT_TIMESTAMP
            WHERE wallet_id = 'W-5555'
        ''', (new_balance,))
        
        ledger_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO ledger_transactions (ledger_tx_id, wallet_id, category, type, amount_minor, ref_type, idempotency_key)
            VALUES (?, 'W-5555', ?, ?, ?, 'MOCK_REF', ?)
        ''', (ledger_id, category, tx_type, amount_minor, idempotency_key))
        
        conn.commit()
        print(f"✅ SUCCESS: Transaction recorded. Type: {tx_type}, Amount: {amount_minor}. New Balance: {new_balance}")
        return True
    
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"⚠️ IDEMPOTENCY HIT: Key '{idempotency_key}' already processed. Safely ignoring. (Error: {e})")
        return False

if __name__ == "__main__":
    print("--- TFA Schema & Ledger Constraint Simulator ---")
    conn = initialize_database()
    
    # Mock Event IDs (acting as UUIDv7)
    valid_payment_idempotency = str(uuid.uuid4())
    
    print("\n1. Simulating Top-Up (Webhook Ingest)...")
    simulate_append_only_ledger(conn, valid_payment_idempotency, amount_minor=25000, is_credit=True)
    
    print("\n2. Simulating Identical Webhook Retry (Concurrency Protection)...")
    simulate_append_only_ledger(conn, valid_payment_idempotency, amount_minor=25000, is_credit=True)
    
    lane_exit_idempotency = str(uuid.uuid4())
    
    print("\n3. Simulating Valid Lane Exit (Barrier Open)...")
    simulate_append_only_ledger(conn, lane_exit_idempotency, amount_minor=3000, is_credit=False)
    
    conn.close()
    print("\n--- Simulation Complete ---")

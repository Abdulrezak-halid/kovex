-- Migration: create accounting tables

CREATE TABLE IF NOT EXISTS accounts (
  id serial PRIMARY KEY,
  name varchar(200) NOT NULL,
  type varchar(50) NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'USD',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id serial PRIMARY KEY,
  account_id integer NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  direction varchar(10) NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'USD',
  reference varchar(200),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id serial PRIMARY KEY,
  account_id integer NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'USD',
  description text,
  incurred_at timestamptz NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'unpaid',
  reference varchar(200),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id serial PRIMARY KEY,
  from_account_id integer NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id integer NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'USD',
  method varchar(100),
  reference varchar(200),
  paid_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS balances (
  id serial PRIMARY KEY,
  account_id integer NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  balance numeric(18,2) NOT NULL,
  as_of timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Existing leads keep their phone; new requests can omit it.
ALTER TABLE sales.budget_leads DROP CONSTRAINT IF EXISTS budget_leads_phone_check;
ALTER TABLE sales.budget_leads ADD CONSTRAINT budget_leads_phone_check
  CHECK (phone = '' OR char_length(phone) BETWEEN 6 AND 40);

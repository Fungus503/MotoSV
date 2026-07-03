-- Add admin policies to 12 tables missing them

-- 1. driver_locations (003)
CREATE POLICY "driver_locations_admin_all" ON public.driver_locations
  FOR ALL USING (public.is_admin());

-- 2. ride_statuses (004)
CREATE POLICY "ride_statuses_admin_all" ON public.ride_statuses
  FOR ALL USING (public.is_admin());

-- 3. saved_places (008)
CREATE POLICY "saved_places_admin_all" ON public.saved_places
  FOR ALL USING (public.is_admin());

-- 4. promo_redemptions (010)
CREATE POLICY "promo_redemptions_admin_all" ON public.promo_redemptions
  FOR ALL USING (public.is_admin());

-- 5. price_estimates (011)
CREATE POLICY "price_estimates_admin_all" ON public.price_estimates
  FOR ALL USING (public.is_admin());

-- 6. push_tokens (012)
CREATE POLICY "push_tokens_admin_all" ON public.push_tokens
  FOR ALL USING (public.is_admin());

-- 7. messages (016)
CREATE POLICY "messages_admin_all" ON public.messages
  FOR ALL USING (public.is_admin());

-- 8. trip_shares (018)
CREATE POLICY "trip_shares_admin_all" ON public.trip_shares
  FOR ALL USING (public.is_admin());

-- 9. wallets (021)
CREATE POLICY "wallets_admin_all" ON public.wallets
  FOR ALL USING (public.is_admin());

-- 10. wallet_transactions (021)
CREATE POLICY "wallet_transactions_admin_all" ON public.wallet_transactions
  FOR ALL USING (public.is_admin());

-- 11. referral_codes (022)
CREATE POLICY "referral_codes_admin_all" ON public.referral_codes
  FOR ALL USING (public.is_admin());

-- 12. referrals (022)
CREATE POLICY "referrals_admin_all" ON public.referrals
  FOR ALL USING (public.is_admin());

-- Add driver_rules read policy for authenticated users
CREATE POLICY "driver_rules_select_authenticated" ON public.driver_rules
  FOR SELECT USING (auth.role() = 'authenticated');

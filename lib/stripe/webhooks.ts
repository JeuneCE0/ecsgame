import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';

type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
  [process.env.STRIPE_PRICE_PRO ?? '']: 'pro',
  [process.env.STRIPE_PRICE_ENTERPRISE ?? '']: 'enterprise',
};

export function constructWebhookEvent(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function mapPriceToTier(priceId: string): SubscriptionTier {
  return PRICE_TO_TIER[priceId] ?? 'free';
}

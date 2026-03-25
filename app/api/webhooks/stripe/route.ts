import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { constructWebhookEvent, mapPriceToTier } from '@/lib/stripe/webhooks';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

interface CheckoutSessionMetadata {
  org_id?: string;
}

function getSubscriptionPriceId(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  if (!item) return '';
  return item.price.id;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();
  const metadata = session.metadata as CheckoutSessionMetadata | null;
  const orgId = metadata?.org_id;

  if (!orgId || !session.subscription) {
    return;
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      stripe_customer_id: session.customer as string,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId);

  if (error) {
    throw new Error(`Failed to update org subscription: ${error.message}`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const priceId = getSubscriptionPriceId(subscription);
  const tier = mapPriceToTier(priceId);

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    throw new Error(`Failed to update subscription tier: ${error.message}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_tier: 'free',
      subscription_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    throw new Error(`Failed to downgrade subscription: ${error.message}`);
  }
}

async function handleInvoicePaymentSucceeded(_invoice: Stripe.Invoice) {
  // billing_events table does not exist in schema — skip logging for now
}

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unhandled event type: ${event.type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error processing webhook';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

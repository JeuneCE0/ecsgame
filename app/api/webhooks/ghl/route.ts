import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { XP_THRESHOLDS } from '@/lib/constants';

const GHL_WEBHOOK_SECRET = process.env.GHL_WEBHOOK_SECRET;

type GHLEventType = 'contact.created' | 'appointment.booked' | 'opportunity.won';

interface GHLWebhookPayload {
  type: GHLEventType;
  contact?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    id?: string;
  };
  appointment?: {
    id?: string;
    title?: string;
  };
  opportunity?: {
    id?: string;
    name?: string;
    monetaryValue?: number;
  };
}

interface ProfileRow {
  id: string;
}

const XP_AWARDS: Record<GHLEventType, { source: string; amount: number; label: string }> = {
  'contact.created': { source: 'lead_generated', amount: 25, label: 'Lead generated via GHL' },
  'appointment.booked': { source: 'call_booked', amount: 50, label: 'Call booked via GHL' },
  'opportunity.won': { source: 'deal_closed', amount: 100, label: 'Deal closed via GHL' },
};

async function resolveUserByEmail(email: string): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1)
    .single();

  if (error || !data) return null;

  const profile = data as ProfileRow;
  return profile.id;
}

async function awardXP(
  userId: string,
  source: string,
  amount: number,
  description: string,
  metadata: Record<string, unknown>
) {
  const supabase = createAdminClient();

  const verificationStatus =
    amount <= XP_THRESHOLDS.AUTO_VERIFY_MAX
      ? 'auto_verified'
      : 'pending_review';

  const { error } = await supabase.from('xp_events').insert({
    user_id: userId,
    source,
    amount,
    description,
    proof_url: null,
    verification_status: verificationStatus,
    metadata,
  });

  if (error) {
    throw new Error(`Failed to award XP: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  if (!GHL_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'GHL webhook secret not configured' },
      { status: 500 }
    );
  }

  const headerSecret = request.headers.get('x-ghl-webhook-secret');

  if (headerSecret !== GHL_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Invalid webhook secret' },
      { status: 401 }
    );
  }

  let payload: GHLWebhookPayload;

  try {
    payload = (await request.json()) as GHLWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const eventType = payload.type;
  const award = XP_AWARDS[eventType];

  if (!award) {
    return NextResponse.json(
      { received: true, skipped: true, reason: `Unhandled event type: ${eventType}` },
      { status: 200 }
    );
  }

  const contactEmail = payload.contact?.email;

  if (!contactEmail) {
    return NextResponse.json(
      { received: true, skipped: true, reason: 'No contact email provided' },
      { status: 200 }
    );
  }

  try {
    const userId = await resolveUserByEmail(contactEmail);

    if (!userId) {
      return NextResponse.json(
        { received: true, skipped: true, reason: 'No matching user found' },
        { status: 200 }
      );
    }

    const metadata: Record<string, unknown> = {
      ghl_event_type: eventType,
      ghl_contact_id: payload.contact?.id ?? null,
    };

    if (eventType === 'appointment.booked' && payload.appointment) {
      metadata.ghl_appointment_id = payload.appointment.id ?? null;
      metadata.ghl_appointment_title = payload.appointment.title ?? null;
    }

    if (eventType === 'opportunity.won' && payload.opportunity) {
      metadata.ghl_opportunity_id = payload.opportunity.id ?? null;
      metadata.ghl_opportunity_name = payload.opportunity.name ?? null;
      metadata.ghl_monetary_value = payload.opportunity.monetaryValue ?? null;
    }

    await awardXP(userId, award.source, award.amount, award.label, metadata);

    return NextResponse.json(
      { received: true, userId, xpAwarded: award.amount, source: award.source },
      { status: 200 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error processing GHL webhook';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

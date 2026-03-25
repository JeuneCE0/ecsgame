import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { XP_THRESHOLDS } from '@/lib/constants';

const VALID_XP_SOURCES = [
  'quest_completion',
  'call_booked',
  'deal_closed',
  'lead_generated',
  'formation_completed',
  'streak_bonus',
  'manual_log',
  'referral',
  'badge_earned',
  'admin_grant',
] as const;

type XPSource = (typeof VALID_XP_SOURCES)[number];

interface XPRequestBody {
  source: string;
  amount: number;
  description?: string;
  proofUrl?: string;
  metadata?: Record<string, unknown>;
}

interface XPEventRow {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  description: string | null;
  proof_url: string | null;
  verification_status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

function isValidXPSource(source: string): source is XPSource {
  return VALID_XP_SOURCES.includes(source as XPSource);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as XPRequestBody;

    if (!body.source || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request: source and positive amount are required' },
        { status: 400 }
      );
    }

    if (!isValidXPSource(body.source)) {
      return NextResponse.json(
        { error: `Invalid XP source: ${body.source}` },
        { status: 400 }
      );
    }

    const verificationStatus =
      body.amount <= XP_THRESHOLDS.AUTO_VERIFY_MAX
        ? 'auto_verified'
        : 'pending_review';

    const { data, error: insertError } = await supabase
      .from('xp_events')
      .insert({
        user_id: user.id,
        source: body.source,
        amount: body.amount,
        description: body.description ?? null,
        proof_url: body.proofUrl ?? null,
        verification_status: verificationStatus,
        metadata: body.metadata ?? {},
      })
      .select(
        'id, user_id, source, amount, description, proof_url, verification_status, metadata, created_at'
      )
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to log XP event' },
        { status: 500 }
      );
    }

    const xpEvent = data as XPEventRow;

    return NextResponse.json({ xpEvent }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

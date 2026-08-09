import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDbTables } from '@/lib/db';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
  }

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ dbConnected: false, profile: null });
  }

  try {
    await initDbTables();
    const rows = await sql`SELECT * FROM users WHERE address = ${address} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ dbConnected: true, profile: null });
    }
    const user = rows[0];
    return NextResponse.json({
      dbConnected: true,
      profile: {
        handle: user.handle || '',
        role: user.role || null,
        skills: user.skills || [],
        bio: user.bio || '',
        avatar: user.avatar || '',
        reputation: user.reputation || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, dbConnected: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, handle, role, bio, skills, avatar, reputation } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ dbConnected: false, message: 'No Neon DB configured' });
    }

    await initDbTables();
    await sql`
      INSERT INTO users (address, handle, role, bio, skills, avatar, reputation)
      VALUES (${address}, ${handle || ''}, ${role || null}, ${bio || ''}, ${skills || []}, ${avatar || ''}, ${JSON.stringify(reputation || {})})
      ON CONFLICT (address) DO UPDATE SET
        handle = EXCLUDED.handle,
        role = EXCLUDED.role,
        bio = EXCLUDED.bio,
        skills = EXCLUDED.skills,
        avatar = EXCLUDED.avatar,
        reputation = EXCLUDED.reputation;
    `;

    return NextResponse.json({ success: true, dbConnected: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, dbConnected: false }, { status: 500 });
  }
}

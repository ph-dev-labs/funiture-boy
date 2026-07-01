import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in Firestore
    await setDoc(doc(db, 'otps', email), {
      code,
      expiresAt: expiresAt.toISOString(),
      createdAt: serverTimestamp(),
    });

    // Send OTP email via Resend
    await resend.emails.send({
      from: 'TrendyTrades Security <no-reply@trendy-trd.com>',
      to: email,
      subject: 'Your TrendyTrades Login Code',
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; background: #0a0b10; color: #fff; max-width: 480px; margin: 0 auto; padding: 40px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #d4af37, #a8810b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">TrendyTrades</h1>
            <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 8px;">Institutional Crypto Trading</p>
          </div>
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Your Login Code</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 28px;">Enter this 6-digit code to complete your login. It expires in 10 minutes.</p>
          <div style="text-align: center; background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 28px; margin-bottom: 28px;">
            <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #d4af37;">${code}</div>
          </div>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">If you didn't request this, please ignore this email and secure your account.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

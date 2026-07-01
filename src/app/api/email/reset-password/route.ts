import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await resend.emails.send({
      from: 'TrendyTrades Security <no-reply@trendy-trd.com>',
      to: email,
      subject: '🔒 Reset Your TrendyTrades Password',
      html: `
        <div style="font-family: Arial, sans-serif; background: #0a0b10; color: #fff; max-width: 480px; margin: 0 auto; padding: 40px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <h1 style="color: #d4af37; font-size: 22px; margin-bottom: 32px;">TrendyTrades</h1>
          <h2 style="font-size: 20px; margin-bottom: 12px;">Password Reset Request</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
            We received a request to reset your password. Use the link sent to this email from Firebase to set a new password.
            This link expires in 1 hour.
          </p>
          <p style="color: rgba(255,255,255,0.4); font-size: 13px;">If you didn't request this, you can safely ignore this email. Your account remains secure.</p>
        </div>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

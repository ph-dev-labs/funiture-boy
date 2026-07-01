import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    await resend.emails.send({
      from: 'TrendyTrades <welcome@trendytrade.net>',
      to: email,
      subject: '🚀 Welcome to TrendyTrades — Start Growing Your Wealth',
      html: `
        <div style="font-family: Arial, sans-serif; background: #0a0b10; color: #fff; max-width: 520px; margin: 0 auto; padding: 40px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #d4af37;">TrendyTrades</h1>
          </div>
          <h2 style="font-size: 22px; margin-bottom: 12px;">Welcome, ${name}! 🎉</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
            Your account has been created successfully. You're now part of an elite community of 180,000+ investors growing their wealth with institutional-grade crypto tools.
          </p>
          <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 24px; margin-bottom: 28px;">
            <h3 style="font-size: 16px; margin-bottom: 16px; color: #d4af37;">Get Started in 3 Steps</h3>
            <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">✅ 1. Verify your email address</p>
            <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">💰 2. Make your first deposit in crypto</p>
            <p style="font-size: 14px; color: rgba(255,255,255,0.7);">📈 3. Choose an investment plan and start earning</p>
          </div>
          <a href="https://trendytrade.net/auth/login" style="display: block; text-align: center; background: linear-gradient(90deg, #d4af37, #a8810b); color: white; padding: 16px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 24px;">
            Access Your Dashboard →
          </a>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">© 2025 TrendyTrades. All rights reserved.</p>
        </div>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generic notification email helper
export async function POST(req: NextRequest) {
  try {
    const { email, name, type, amount, currency, status } = await req.json();

    const subjects: Record<string, string> = {
      deposit_received: '💰 Deposit Request Received — TrendyTrades',
      deposit_approved: '✅ Deposit Approved — TrendyTrades',
      deposit_rejected: '❌ Deposit Rejected — TrendyTrades',
      withdrawal_received: '📤 Withdrawal Request Received — TrendyTrades',
      withdrawal_approved: '✅ Withdrawal Processed — TrendyTrades',
      withdrawal_rejected: '❌ Withdrawal Rejected — TrendyTrades',
      profit_credited: '📈 Profit Credited — TrendyTrades',
    };

    const colors: Record<string, string> = {
      deposit_approved: '#00e676',
      withdrawal_approved: '#00e676',
      profit_credited: '#00e676',
      deposit_rejected: '#ff1744',
      withdrawal_rejected: '#ff1744',
      deposit_received: '#d4af37',
      withdrawal_received: '#d4af37',
    };

    const color = colors[type] || '#d4af37';
    const subject = subjects[type] || 'Notification from TrendyTrades';

    await resend.emails.send({
      from: 'TrendyTrades Notifications <no-reply@trendytrade.net>',
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0a0b10; color: #fff; max-width: 480px; margin: 0 auto; padding: 40px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <h1 style="color: #d4af37; font-size: 22px; margin-bottom: 4px;">TrendyTrades</h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 32px;">Account Notification</p>
          <h2 style="font-size: 18px; margin-bottom: 16px;">${subject.replace(' — TrendyTrades','')}</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 24px;">Hi ${name || 'Trader'},</p>
          ${amount ? `<div style="background: rgba(${color === '#00e676' ? '0,230,118' : '212,175,55'},0.08); border: 1px solid rgba(${color === '#00e676' ? '0,230,118' : '212,175,55'},0.25); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 32px; font-weight: 800; color: ${color};">${amount} ${currency || 'USDT'}</div>
            ${status ? `<div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">${status}</div>` : ''}
          </div>` : ''}
          <a href="https://trendytrade.net/dashboard" style="display: block; text-align: center; background: linear-gradient(90deg, #d4af37, #a8810b); color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 24px;">
            View Dashboard →
          </a>
          <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center;">© 2025 TrendyTrades · This is an automated notification.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

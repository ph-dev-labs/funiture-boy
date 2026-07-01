import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate the email verification link
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be whitelisted in the Firebase Console.
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://trendy-trd.com'}/auth/login?verified=true`,
      handleCodeInApp: false,
    };
    
    // We can also just call it without actionCodeSettings if we want the default Firebase handler
    // The default handler gives a generic "Your email has been verified" page
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

    // Send the email via Resend
    await resend.emails.send({
      from: 'TrendyTrades Security <no-reply@trendy-trd.com>',
      to: email,
      subject: 'Verify your email for TrendyTrades',
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; background: #0a0b10; color: #fff; max-width: 480px; margin: 0 auto; padding: 40px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #d4af37, #a8810b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">TrendyTrades</h1>
            <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 8px;">Institutional Crypto Trading</p>
          </div>
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Verify your email address</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 28px;">
            Hello ${name || 'Trader'},<br><br>
            Please verify your email address to complete your registration and secure your account.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(90deg, #d4af37, #a8810b); color: #fff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(212,175,55,0.4);">Verify Email</a>
          </div>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

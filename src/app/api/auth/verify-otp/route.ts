import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const otpRef = doc(db, 'otps', email);
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    const { code: storedCode, expiresAt } = otpSnap.data();

    if (new Date() > new Date(expiresAt)) {
      await deleteDoc(otpRef);
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    if (code !== storedCode) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    }

    // OTP verified - delete it
    await deleteDoc(otpRef);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

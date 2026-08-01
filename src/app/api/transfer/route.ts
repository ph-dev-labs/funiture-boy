import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const KNOWN_ERRORS = new Set([
  'Recipient account not found. Double-check the ID.',
  'You cannot transfer funds to yourself.',
  'Insufficient available balance.',
]);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    let senderUid: string;
    try {
      senderUid = (await adminAuth.verifyIdToken(idToken)).uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { recipientId, amount } = await req.json();

    if (!recipientId || typeof recipientId !== 'string') {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }
    const transferAmount = Number(amount);
    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: 'Enter a valid transfer amount' }, { status: 400 });
    }
    if (recipientId === senderUid) {
      return NextResponse.json({ error: 'You cannot transfer funds to yourself.' }, { status: 400 });
    }

    const senderRef = adminDb.collection('users').doc(senderUid);
    const recipientRef = adminDb.collection('users').doc(recipientId);

    const result = await adminDb.runTransaction(async (tx) => {
      const [senderSnap, recipientSnap] = await Promise.all([tx.get(senderRef), tx.get(recipientRef)]);

      if (!recipientSnap.exists) {
        throw new Error('Recipient account not found. Double-check the ID.');
      }

      const senderData = senderSnap.data() || {};
      const recipientData = recipientSnap.data()!;
      const senderBalance = senderData.balance || 0;

      if (senderBalance < transferAmount) {
        throw new Error('Insufficient available balance.');
      }

      tx.update(senderRef, { balance: FieldValue.increment(-transferAmount) });
      tx.update(recipientRef, { balance: FieldValue.increment(transferAmount) });

      const senderTxRef = adminDb.collection('transactions').doc();
      const recipientTxRef = adminDb.collection('transactions').doc();
      const recipientLabel = recipientData.displayName || recipientData.email || recipientId;
      const senderLabel = senderData.displayName || senderData.email || senderUid;

      tx.set(senderTxRef, {
        uid: senderUid,
        amount: transferAmount,
        type: 'transfer_sent',
        description: `Transfer to ${recipientLabel}`,
        status: 'completed',
        counterpartyId: recipientId,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(recipientTxRef, {
        uid: recipientId,
        amount: transferAmount,
        type: 'transfer_received',
        description: `Transfer from ${senderLabel}`,
        status: 'completed',
        counterpartyId: senderUid,
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        newBalance: senderBalance - transferAmount,
        recipientEmail: recipientData.email as string | undefined,
        recipientName: recipientLabel,
      };
    });

    if (result.recipientEmail) {
      fetch(new URL('/api/email/notify', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.recipientEmail,
          name: result.recipientName,
          type: 'transfer_received',
          amount: transferAmount.toFixed(2),
          currency: 'USD',
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, newBalance: result.newBalance });
  } catch (error: any) {
    console.error('Transfer error:', error);
    const message: string = error?.message || 'Failed to process transfer';
    const status = KNOWN_ERRORS.has(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

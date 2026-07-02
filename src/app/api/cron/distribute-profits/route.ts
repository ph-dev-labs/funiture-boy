import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin-db';
import { FieldValue } from 'firebase-admin/firestore';

// Daily profit rates per plan (percentage of invested amount per day)
const PLAN_RATES: Record<string, number> = {
  starter: 0.015,  // 1.5%
  growth: 0.025,   // 2.5%
  premium: 0.035,  // 3.5%
  elite: 0.05,     // 5%
};

export async function GET(req: NextRequest) {
  // ── Auth guard — only Vercel cron (or a manual call with the secret) may trigger this
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all active investments using Admin SDK (bypasses Firestore rules)
    const investmentsSnap = await adminDb
      .collection('investments')
      .where('status', '==', 'active')
      .get();

    if (investmentsSnap.empty) {
      return NextResponse.json({ success: true, processed: 0, message: 'No active investments.' });
    }

    const results: { uid: string; plan: string; profit: number }[] = [];
    const batch = adminDb.batch(); // Use a batch for atomic writes

    for (const investDoc of investmentsSnap.docs) {
      const inv = investDoc.data();
      const { uid, plan, amount } = inv;

      if (!uid || !amount || amount <= 0) continue;

      // ── Skip if already paid in the last 20 hours
      if (inv.lastPayoutAt) {
        const lastPayout = inv.lastPayoutAt.toDate ? inv.lastPayoutAt.toDate() : new Date(inv.lastPayoutAt);
        const diffMs = Date.now() - lastPayout.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 20) {
          console.log(`[cron] Skipping investment ${investDoc.id} - paid ${diffHours.toFixed(1)}h ago`);
          continue;
        }
      }

      const safePlan = plan || 'Unknown';
      const rate = PLAN_RATES[safePlan.toLowerCase()] ?? 0.015;
      const dailyProfit = parseFloat((amount * rate).toFixed(2));

      if (dailyProfit <= 0) continue;

      // ── 1. Atomically increment balance and tradingProfit on the user doc
      const userRef = adminDb.collection('users').doc(uid);
      batch.update(userRef, {
        tradingProfit: FieldValue.increment(dailyProfit),
        balance: FieldValue.increment(dailyProfit),
        lastProfitAt: FieldValue.serverTimestamp(),
      });

      // ── 2. Log a transaction record
      const txRef = adminDb.collection('transactions').doc();
      batch.set(txRef, {
        uid,
        type: 'profit',
        amount: dailyProfit,
        plan: safePlan,
        description: `Daily ${safePlan} plan profit (${(rate * 100).toFixed(1)}%)`,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
      });

      // ── 3. In-app notification
      const notifRef = adminDb.collection(`users/${uid}/notifications`).doc();
      batch.set(notifRef, {
        title: 'Daily Profit Credited 📈',
        message: `$${dailyProfit.toFixed(2)} has been added to your account from your ${safePlan} plan.`,
        type: 'success',
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      // ── 4. Update lastPayoutAt & Auto-expire if past end date
      const updateData: Record<string, any> = {
        lastPayoutAt: FieldValue.serverTimestamp(),
      };

      if (inv.endDate) {
        const endDate = inv.endDate.toDate ? inv.endDate.toDate() : new Date(inv.endDate);
        if (new Date() >= endDate) {
          updateData.status = 'completed';
        }
      }

      batch.update(investDoc.ref, updateData);

      results.push({ uid, plan, profit: dailyProfit });
    }

    // Commit all writes atomically
    await batch.commit();

    console.log(`[cron] Profit distributed to ${results.length} investors.`);

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('[cron] Profit distribution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


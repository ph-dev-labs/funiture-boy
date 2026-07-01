import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Daily profit rates per plan (percentage of balance per day)
const PLAN_RATES: Record<string, number> = {
  starter: 0.015,  // 1.5%
  growth: 0.025,   // 2.5%
  premium: 0.035,  // 3.5%
  elite: 0.05,     // 5%
};

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active investments
    const investmentsSnap = await getDocs(
      query(collection(db, 'investments'), where('status', '==', 'active'))
    );

    const results: { uid: string; profit: number }[] = [];

    for (const investDoc of investmentsSnap.docs) {
      const inv = investDoc.data();
      const { uid, plan, amount } = inv;
      const rate = PLAN_RATES[plan?.toLowerCase()] ?? 0.015;
      const dailyProfit = parseFloat((amount * rate).toFixed(2));

      if (dailyProfit <= 0) continue;

      // Add profit to user balance
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        tradingProfit: increment(dailyProfit),
        balance: increment(dailyProfit),
        lastProfitAt: serverTimestamp(),
      });

      // Log transaction
      await addDoc(collection(db, 'transactions'), {
        uid,
        type: 'profit',
        amount: dailyProfit,
        plan,
        description: `Daily ${plan} plan profit (${(rate * 100).toFixed(1)}%)`,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // Add in-app notification
      await addDoc(collection(db, `users/${uid}/notifications`), {
        title: 'Daily Profit Credited 📈',
        message: `$${dailyProfit.toFixed(2)} has been added to your account from your ${plan} plan.`,
        type: 'success',
        read: false,
        createdAt: serverTimestamp(),
      });



      results.push({ uid, profit: dailyProfit });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Cron profit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

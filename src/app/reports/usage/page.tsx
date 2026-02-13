import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import UsageDashboard from './usage-dashboard';

export default async function UsageReportPage() {
  const session = await auth();
  if (!session?.user) redirect('/api/auth/signin');

  return (
    <main className="main-content-wide">
      <header className="page-header">
        <h1>📊 Usage</h1>
        <p>Cron + Heartbeats. Filterbar, Pivot nach Job×Model, Charts nach Zeit.</p>
      </header>
      <UsageDashboard />
    </main>
  );
}

import { AppLayout } from '@/components/layout';
import { LedgerView } from '@/components/ledger-view';

export default function Home() {
  return (
    <AppLayout onExport={() => {}}>
      <LedgerView />
    </AppLayout>
  );
}

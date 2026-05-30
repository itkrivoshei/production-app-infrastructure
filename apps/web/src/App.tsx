import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Docs } from '@/pages/Docs';
import { LoadTest } from '@/pages/LoadTest';
import { Logs } from '@/pages/Logs';
import { Metrics } from '@/pages/Metrics';
import { Overview } from '@/pages/Overview';
import { SystemInfo } from '@/pages/SystemInfo';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/load-test" element={<LoadTest />} />
        <Route path="/system" element={<SystemInfo />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

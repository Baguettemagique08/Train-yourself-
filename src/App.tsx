import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CasesListPage } from '@/pages/cases/CasesListPage'
import { CaseDetailPage } from '@/pages/cases/CaseDetailPage'
import ReconcilerPage from '@/pages/reconciler/ReconcilerPage'
import SpecsCheckerPage from '@/pages/specs/SpecsCheckerPage'
import DraftingCenterPage from '@/pages/drafts/DraftingCenterPage'
import FuelReadinessPage from '@/pages/fuel-readiness/FuelReadinessPage'
import AdminPage from '@/pages/admin/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesListPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/reconciler" element={<ReconcilerPage />} />
          <Route path="/specs" element={<SpecsCheckerPage />} />
          <Route path="/drafts" element={<DraftingCenterPage />} />
          <Route path="/fuel-readiness" element={<FuelReadinessPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

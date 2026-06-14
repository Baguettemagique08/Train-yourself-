import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CasesListPage } from '@/pages/cases/CasesListPage'
import { CaseDetailPage } from '@/pages/cases/CaseDetailPage'
import { DeliveriesPage } from '@/pages/deliveries/DeliveriesPage'
import { CounterpartiesPage } from '@/pages/counterparties/CounterpartiesPage'
import { VesselsPage } from '@/pages/vessels/VesselsPage'
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
          {/* Operations */}
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/cases"       element={<CasesListPage />} />
          <Route path="/cases/:id"   element={<CaseDetailPage />} />
          <Route path="/deliveries"  element={<DeliveriesPage />} />

          {/* Analysis */}
          <Route path="/reconciler"  element={<ReconcilerPage />} />
          <Route path="/specs"       element={<SpecsCheckerPage />} />

          {/* Communications */}
          <Route path="/drafts"      element={<DraftingCenterPage />} />

          {/* Compliance */}
          <Route path="/fuel-readiness" element={<FuelReadinessPage />} />

          {/* Masterdata */}
          <Route path="/counterparties" element={<CounterpartiesPage />} />
          <Route path="/vessels"        element={<VesselsPage />} />

          {/* Settings */}
          <Route path="/admin"       element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

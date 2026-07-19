import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import History from './pages/History'
import Stats from './pages/Stats'
import { LanguageProvider } from './lib/i18n'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="history" element={<History />} />
            <Route path="stats" element={<Stats />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

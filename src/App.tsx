import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { MobileBalanceView } from './pages/mobile/MobileBalanceView'

import { CreateProject } from './pages/admin/CreateProject'
import { ProjectDetail } from './pages/admin/ProjectDetail'
import { Login } from './pages/auth/Login'
import ProfessorDashboard from './pages/professor/ProfessorDashboard'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/professor" element={<ProfessorDashboard />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/login" replace />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="admin/create" element={<CreateProject />} />
                    <Route path="admin/edit/:id" element={<CreateProject />} />
                    <Route path="admin/projects/:id" element={<ProjectDetail />} />
                    <Route path="mobile/:projectId" element={<MobileBalanceView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

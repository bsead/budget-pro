import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    // Check if we are in a "public" or "mobile" specific view that shouldn't have the admin sidebar
    // But currently, the user seems to want this for the Admin side. 
    // The MobileBalanceView is rendered under /mobile/... but also inside this Layout in App.tsx?
    // Let's check App.tsx. Yes, MobileBalanceView is inside Layout.
    // Usually Mobile View shouldn't have the Admin Sidebar.

    const isMobileView = location.pathname.startsWith('/mobile')

    if (isMobileView) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <Outlet />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
                    flex flex-col
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:block
                `}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Budget Pro</h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLink to="/admin" icon={<HomeIcon />} label="프로젝트 관리" active={location.pathname === '/admin' || location.pathname.startsWith('/admin/projects') || location.pathname.startsWith('/admin/edit') || location.pathname.startsWith('/admin/create')} />
                    {/* Add more links here if needed */}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
                    >
                        <LogoutIcon />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 lg:hidden sticky top-0 z-10">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                    >
                        <MenuIcon />
                    </button>
                    <span className="font-bold text-lg text-gray-900">Budget Pro</span>
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

function NavLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link
            to={to}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${active
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }
            `}
        >
            <span className={`${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {icon}
            </span>
            {label}
        </Link>
    )
}

// Icons
function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    )
}

function LogoutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
    )
}

function MenuIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    )
}

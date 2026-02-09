import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import clsx from 'clsx'

export function MobileBalanceView() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState<any>(null)
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        if (projectId) {
            fetchData()

            const subscription = supabase
                .channel('public:expenses')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `project_id=eq.${projectId}` }, () => {
                    fetchData()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(subscription)
            }
        }
    }, [projectId])

    async function fetchData() {
        if (!projectId) return

        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single()

        if (projectError) {
            console.error('Error fetching project:', projectError)
            setLoading(false)
            return
        }

        const { data: expenseData, error: expenseError } = await supabase
            .from('expenses')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (expenseError) console.error('Error fetching expenses:', expenseError)

        setProject(projectData)
        setExpenses(expenseData || [])
        setLoading(false)
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600">로딩 중...</div>
    if (!project) return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">프로젝트를 불러올 수 없습니다.</div>

    const calculateUsage = (category: string) => expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)

    const budgetItems = [
        { label: '연구재료비', budget: project.budget_materials || 0, used: calculateUsage('materials') }, // New Category
        { label: '학생 인건비', budget: project.budget_student_labor, used: calculateUsage('student_labor') },
        { label: '연구시설장비비', budget: project.budget_equipment, used: calculateUsage('equipment') },
        { label: '연구활동비', budget: project.budget_activity, used: calculateUsage('activity') },
        { label: '연구수당', budget: project.budget_allowance, used: calculateUsage('allowance') },
    ]

    const totalBudget = project.total_budget
    const totalUsed = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalRemaining = totalBudget - totalUsed

    const displayedExpenses = showAll ? expenses : expenses.slice(0, 5)

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-10">
            {/* Header / Professor Profile */}
            <div className="bg-white p-6 pb-8 rounded-b-[2rem] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        {/* 뒤로 가기 버튼 */}
                        <button
                            onClick={() => navigate('/professor')}
                            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="목록으로"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                        <div>
                            {/* Placeholder for Professor Name - using Project Name as proxy or generic */}
                            <h1 className="text-2xl font-bold text-gray-900">교수님, 안녕하세요</h1>
                            <p className="text-gray-500 text-sm mt-1">{project.name}</p>
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-full p-2">
                        <span className="text-2xl">👨‍🏫</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-6">
                    {/* 도넛 차트 */}
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* 배경 원 */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="12"
                            />
                            {/* 사용률 원 */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke={totalUsed / totalBudget > 0.8 ? "#ef4444" : "#3b82f6"}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${(totalUsed / totalBudget) * 251.2} 251.2`}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-gray-900">
                                {Math.round((totalUsed / totalBudget) * 100)}%
                            </span>
                            <span className="text-xs text-gray-400">사용</span>
                        </div>
                    </div>

                    {/* 잔액 정보 */}
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">현재 사용 가능한 연구비 잔액</p>
                        <h2 className="text-3xl font-black text-blue-600 tracking-tight">
                            {totalRemaining.toLocaleString()}
                            <span className="text-xl text-gray-400 ml-1 font-bold">원</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            총 {totalBudget.toLocaleString()}원 중 {totalUsed.toLocaleString()}원 사용
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 mt-8 space-y-8">
                {/* 1. Budget Usage Status (Pie Chart Placeholder / Bar List) */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-blue-500">📊</span> 예산 사용 현황
                    </h3>
                    <div className="space-y-4">
                        {budgetItems.map((item, index) => {
                            // Show if budget exists OR if there is usage (even if budget is 0)
                            if (item.budget === 0 && item.used === 0) return null

                            // Calculate percent, handling division by zero
                            const percent = item.budget > 0 ? (item.used / item.budget) * 100 : (item.used > 0 ? 100 : 0)

                            return (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1 font-medium">
                                        <span className="text-gray-700">{item.label}</span>
                                        <span className={clsx(item.used > item.budget ? "text-red-500 font-bold" : "text-gray-900")}>
                                            {item.budget > 0 ? `${Math.round(percent)}%` : '예산 미배정'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={clsx("h-full rounded-full", item.used > item.budget ? "bg-red-500" : "bg-blue-500")}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span className={clsx(item.used > item.budget && "text-red-500 font-bold")}>{item.used.toLocaleString()}원 사용</span>
                                        <span>/ {item.budget.toLocaleString()}원</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 2. Recent Execution History */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-blue-500">🧾</span> 최근 집행 내역
                    </h3>
                    <div className="bg-white rounded-2xl shadow-sm p-2">
                        {expenses.length === 0 ? (
                            <p className="text-center text-gray-400 py-6 text-sm">최근 내역이 없습니다.</p>
                        ) : (
                            displayedExpenses.map((expense, idx) => (
                                <div key={expense.id} className={clsx("p-4 flex justify-between items-center", idx !== displayedExpenses.length - 1 && "border-b border-gray-100")}>
                                    <div>
                                        <p className="font-bold text-gray-900">{expense.description}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(expense.created_at).toLocaleDateString()} • {
                                                budgetItems.find(b =>
                                                    (b.label === '연구재료비' && expense.category === 'materials') ||
                                                    (b.label === '학생 인건비' && expense.category === 'student_labor') ||
                                                    (b.label === '연구시설장비비' && expense.category === 'equipment') ||
                                                    (b.label === '연구활동비' && expense.category === 'activity') ||
                                                    (b.label === '연구수당' && expense.category === 'allowance')
                                                )?.label || expense.category
                                            }
                                        </p>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        -{expense.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                        {expenses.length > 5 && (
                            <div className="p-3 text-center border-t border-gray-100">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-sm text-blue-600 font-bold hover:underline"
                                >
                                    {showAll ? '접기' : '전체 보기'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

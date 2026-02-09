import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'

export function CreateProject() {
    const navigate = useNavigate()
    const { id } = useParams() // Get ID for edit mode
    const isEditMode = Boolean(id)

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        professor_name: '',
        professor_email: '',
        total_budget: '',
        budget_materials: '',
        budget_student_labor: '',
        budget_equipment: '',
        budget_activity: '',
        budget_allowance: '',
    })

    useEffect(() => {
        if (isEditMode && id) {
            fetchProject()
        }
    }, [id])

    async function fetchProject() {
        setLoading(true)
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            alert('프로젝트 불러오기 실패: ' + error.message)
            navigate('/admin')
        } else if (data) {
            setFormData({
                name: data.name,
                professor_name: data.professor_name || '',
                professor_email: data.professor_email || '',
                total_budget: (data.total_budget / 1000).toString(),
                budget_materials: (data.budget_materials / 1000).toString(),
                budget_student_labor: (data.budget_student_labor / 1000).toString(),
                budget_equipment: (data.budget_equipment / 1000).toString(),
                budget_activity: (data.budget_activity / 1000).toString(),
                budget_allowance: (data.budget_allowance / 1000).toString(),
            })
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const projectData = {
            name: formData.name,
            professor_name: formData.professor_name,
            professor_email: formData.professor_email,
            total_budget: Number(formData.total_budget || 0) * 1000,
            budget_materials: Number(formData.budget_materials || 0) * 1000,
            budget_student_labor: Number(formData.budget_student_labor || 0) * 1000,
            budget_equipment: Number(formData.budget_equipment || 0) * 1000,
            budget_activity: Number(formData.budget_activity || 0) * 1000,
            budget_allowance: Number(formData.budget_allowance || 0) * 1000,
        }

        // Validation: Sum of sub-budgets should not exceed total budget
        const totalSubBudget =
            projectData.budget_materials +
            projectData.budget_student_labor +
            projectData.budget_equipment +
            projectData.budget_activity +
            projectData.budget_allowance

        if (totalSubBudget > projectData.total_budget) {
            alert(`예산 초과! 🚨\n\n세부 예산의 합계(${totalSubBudget.toLocaleString()}원)가\n총 예산(${projectData.total_budget.toLocaleString()}원)을 초과했습니다.\n\n예산을 다시 확인해주세요.`)
            setLoading(false)
            return
        }

        let error
        if (isEditMode && id) {
            // Update
            const { error: updateError } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', id)
            error = updateError
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('projects')
                .insert([projectData])
            error = insertError
        }

        if (error) {
            alert(isEditMode ? '수정 실패: ' + error.message : '생성 실패: ' + error.message)
        } else {
            navigate('/admin')
        }
        setLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    if (loading && isEditMode && !formData.name) return <div className="p-10 text-center">불러오는 중...</div>

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center mb-6">
                <button onClick={() => navigate('/admin')} className="text-gray-500 mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-800">{isEditMode ? '과제 수정' : '새 과제 등록'}</h1>
            </div>

            <div className="max-w-md mx-auto px-4">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Project Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">과제 상세 정보</h3>
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">과제명</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: NSF Grant #2049"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">책임 교수</label>
                                <input
                                    type="text"
                                    name="professor_name"
                                    className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: 김철수 교수"
                                    value={formData.professor_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">책임 교수 이메일 (필수)</label>
                                <input
                                    type="email"
                                    name="professor_email"
                                    required
                                    className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: prof@univ.edu"
                                    value={formData.professor_email}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-blue-500 mt-1">* 교수가 이 이메일로 로그인하면 과제가 자동 연결됩니다.</p>
                            </div>
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">예산 배정</h3>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">단위: 천원</span>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">총 예산</label>
                                <input
                                    type="number"
                                    name="total_budget"
                                    required
                                    className="w-full bg-blue-50 border-transparent rounded-xl p-3 font-black text-blue-900 text-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    value={formData.total_budget}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">연구재료비</label>
                                    <input
                                        type="number"
                                        name="budget_materials"
                                        className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        value={formData.budget_materials}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">학생 인건비</label>
                                        <input
                                            type="number"
                                            name="budget_student_labor"
                                            className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            value={formData.budget_student_labor}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">연구시설장비비</label>
                                        <input
                                            type="number"
                                            name="budget_equipment"
                                            className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            value={formData.budget_equipment}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">연구활동비</label>
                                        <input
                                            type="number"
                                            name="budget_activity"
                                            className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            value={formData.budget_activity}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">연구수당</label>
                                        <input
                                            type="number"
                                            name="budget_allowance"
                                            className="w-full bg-gray-50 border-transparent rounded-xl p-3 font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            value={formData.budget_allowance}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
                    >
                        {loading ? '저장 중...' : (isEditMode ? '수정사항 저장' : '과제 등록하기')}
                    </button>
                </form>
            </div>
        </div>
    )
}

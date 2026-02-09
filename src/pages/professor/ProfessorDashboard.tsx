import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Project {
    id: string
    name: string
    professor_name: string
    total_budget: number
}

export default function ProfessorDashboard() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        setLoading(true)
        // RLS가 자동으로 본인 프로젝트만 필터링해줌
        const { data, error } = await supabase
            .from('projects')
            .select('id, name, professor_name, total_budget')

        if (error) {
            console.error('Error fetching projects:', error)
        } else {
            setProjects(data || [])
        }
        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">불러오는 중...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">내 연구 과제</h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500"
                >
                    로그아웃
                </button>
            </div>

            {/* Project List */}
            <div className="p-4 space-y-3">
                {projects.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        배정된 프로젝트가 없습니다.
                    </div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/mobile/${project.id}`)}
                            className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {project.professor_name || '담당자 미지정'}
                            </p>
                            <p className="text-blue-600 font-bold mt-2">
                                총 예산: {project.total_budget?.toLocaleString()}원
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

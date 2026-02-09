import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (error) console.error('Error fetching projects:', error)
        else setProjects(data || [])
    }

    async function handleDelete(id: string) {
        if (!window.confirm('정말 삭제하시겠습니까? 관련 지출 내역도 모두 삭제될 수 있습니다. (설정에 따라 다름)')) return

        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) {
            alert('삭제 실패: ' + error.message)
        } else {
            fetchProjects()
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 break-keep">프로젝트 관리 (Admin)</h1>
                <Link to="/admin/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md whitespace-nowrap">
                    + 새 프로젝트
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">책임 교수 (과제명)</th>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">총 예산</th>
                                <th className="px-4 md:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">관리</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold">{project.professor_name || '교수 미지정'}</span>
                                            <span className="text-sm text-gray-500">{project.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-600">
                                        {project.total_budget?.toLocaleString()}원
                                    </td>
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center space-x-2">
                                        <Link
                                            to={`/admin/projects/${project.id}`}
                                            className="text-blue-600 font-bold hover:underline"
                                        >
                                            상세보기
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <Link
                                            to={`/admin/edit/${project.id}`}
                                            className="text-gray-500 font-medium hover:text-gray-800"
                                        >
                                            수정
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="text-red-400 font-medium hover:text-red-600"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                                        등록된 프로젝트가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

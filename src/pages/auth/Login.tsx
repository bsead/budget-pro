import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        const emailToUse = email.trim()
        const passwordToUse = password.trim()

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email: emailToUse,
                password: passwordToUse,
            })
            if (error) {
                console.error('Signup Error:', error)
                setMessage('가입 실패: ' + error.message)
            }
            else setMessage('가입 확인 메일을 보냈습니다. (가짜 메일일 경우 자동 승인될 수 있음)')
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: passwordToUse,
            })
            if (error) {
                console.error('Login Error:', error)
                setMessage('로그인 실패: ' + error.message)
            } else {
                console.log('Login successful:', data)
                // Check role and navigate
                if (emailToUse.toLowerCase().includes('admin')) {
                    navigate('/admin')
                } else {
                    // Try to find their projects by email (priority) or ID
                    const { data: projects } = await supabase
                        .from('projects')
                        .select('id')
                        .or(`professor_id.eq.${data.user.id},professor_email.eq.${emailToUse}`)

                    if (projects && projects.length === 1) {
                        // 프로젝트가 1개면 바로 모바일 뷰로
                        navigate(`/mobile/${projects[0].id}`)
                    } else if (projects && projects.length > 1) {
                        // 프로젝트가 여러 개면 교수님 전용 목록 페이지로
                        navigate('/professor')
                    } else {
                        // 프로젝트 없으면 안내
                        setMessage('배정된 프로젝트가 없습니다.')
                    }
                }
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isSignUp ? '계정 생성' : '로그인'}
                </h2>

                {message && (
                    <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">이메일</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                    >
                        {isSignUp ? '가입하기' : '로그인'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 가입하기'}
                    </button>
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { GraduationCap, Lock, User } from 'lucide-react';
import { UserRole } from '../App';
import { authService } from '../services/auth.service';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState<any>({
    student_id: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    student_type: 'New',
    course: '',
    year_level: 1,
    contact_number: '',
    address: '',
    birth_date: '',
    gender: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [studentIdLoading, setStudentIdLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchNextId = async () => {
      if (!showRegister) return;
      try {
        setStudentIdLoading(true);
        const next = await authService.getNextStudentId();
        if (!mounted) return;
        setRegForm((prev: any) => ({ ...prev, student_id: next, username: prev.username || next }));
      } catch (e) {
        // ignore — registration will still work as backend will generate id
      } finally {
        if (mounted) setStudentIdLoading(false);
      }
    };

    if (showRegister) fetchNextId();
    return () => { mounted = false; };
  }, [showRegister]);

  // Captcha generation
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 8) + 1; // 1-8
    const b = Math.floor(Math.random() * 8) + 1; // 1-8
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password.');
      generateCaptcha();
      return;
    }

    const expected = captchaA + captchaB;
    if (String(expected) !== String(captchaAnswer).trim()) {
      setError('Captcha answer is incorrect. Please try again.');
      generateCaptcha();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await authService.login({ username, password });

      if (response.success) {
        const role = response.data.user.role as UserRole;
        onLogin(role);
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
        generateCaptcha();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Informatics College
                </h1>
                <p className="text-2xl text-slate-600">Northgate Campus</p>
                <p className="text-xl text-slate-500">Enrollment System</p>
              </div>
              <p className="text-slate-600 max-w-md">
                Seamlessly manage your academic journey with our modern enrollment platform.
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Welcome Back</h2>
                  <p className="text-slate-500">Sign in to continue</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Roles: superadmin, dean, registrar, admin, or student ID
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* Simple Captcha */}
                  <div className="space-y-2">
                    <Label htmlFor="captcha" className="text-slate-700">Captcha: solve</Label>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 bg-slate-100 rounded-md">{captchaA} + {captchaB} =</div>
                      <Input
                        id="captcha"
                        type="text"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        className="h-12 border-slate-200 focus:border-blue-500 rounded-xl w-32"
                        placeholder="Answer"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateCaptcha}>New</Button>
                    </div>
                    <p className="text-xs text-slate-500">Prove you're human — solve the addition.</p>
                  </div>

                  <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </a>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  Need help? Contact support
                </div>
                <div className="mt-4 text-center">
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }} className="text-sm text-blue-600 hover:text-blue-700">Register as a new student</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Registration Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Registration</DialogTitle>
            <DialogDescription>Register to request an account (student)</DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!regForm.student_id) return alert('Student ID is required');
            if (!regForm.password || regForm.password.length < 6) return alert('Password must be at least 6 characters');
            if (regForm.password !== regForm.confirmPassword) return alert('Passwords do not match');
            try {
              setRegLoading(true);
              const payload = {
                username: regForm.username || regForm.student_id,
                password: regForm.password,
                email: regForm.email,
                role: 'student',
                student: {
                  student_id: regForm.student_id,
                  first_name: regForm.first_name,
                  middle_name: regForm.middle_name,
                  last_name: regForm.last_name,
                  suffix: regForm.suffix,
                  student_type: regForm.student_type,
                  course: regForm.course,
                  year_level: regForm.year_level,
                  contact_number: regForm.contact_number,
                  address: regForm.address,
                  birth_date: regForm.birth_date,
                  gender: regForm.gender
                }
              };

              const resp = await authService.register(payload as any);
              if (resp.success) {
                alert('Registration successful. You can now sign in with your credentials.');
                setShowRegister(false);
                setRegForm({ student_id: '', username: '', password: '', confirmPassword: '', email: '', first_name: '', middle_name: '', last_name: '', suffix: '', student_type: 'New', course: '', year_level: 1, contact_number: '', address: '', birth_date: '', gender: '' });
              } else {
                alert(resp.message || 'Registration failed');
              }
            } catch (err: any) {
              alert(err.message || 'Registration failed');
            } finally {
              setRegLoading(false);
            }
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Student Number</Label>
                <Input value={regForm.student_id} readOnly className="mt-2 bg-slate-100" />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} className="mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Password</Label>
                <Input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input type="password" value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} className="mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input value={regForm.first_name} onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={regForm.last_name} onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })} className="mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input value={regForm.contact_number} onChange={(e) => setRegForm({ ...regForm, contact_number: e.target.value })} className="mt-2" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRegister(false)}>Cancel</Button>
              <Button type="submit" disabled={regLoading}>{regLoading ? 'Registering...' : 'Register'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
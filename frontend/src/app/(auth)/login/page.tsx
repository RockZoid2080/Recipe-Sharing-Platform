'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      login(res.data.accessToken, res.data.user);
      toast.success('Welcome back!');
      router.push('/recipes'); // Redirect to dashboard
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center animate-fade-in relative">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary-500/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-orange-600/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 relative z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Welcome Back</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Log in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                {...register('email')}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                {...register('password')}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer group">
              <input type="checkbox" className="rounded border-gray-600 bg-[var(--color-surface)] text-primary-500 focus:ring-primary-500 cursor-pointer" />
              <span className="group-hover:text-white transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-primary-400 hover:text-primary-300 hover:underline transition-all">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

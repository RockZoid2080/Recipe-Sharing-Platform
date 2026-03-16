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
import { Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/register', data);
      login(res.data.accessToken, res.data.user);
      toast.success('Account created successfully!');
      router.push('/recipes'); // Redirect to dashboard
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center animate-fade-in relative">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -right-12 w-64 h-64 bg-primary-500/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -left-12 w-64 h-64 bg-orange-600/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse pointer-events-none delay-1000" />

      <div className="glass-card w-full max-w-md p-8 relative z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Join RecipeShare</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Create an account to save and share recipes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                {...register('name')}
                className="input-field pl-10"
                placeholder="Gordon Ramsay"
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name.message}</p>}
          </div>

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
                placeholder="chef@example.com"
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
                placeholder="At least 8 characters"
              />
            </div>
            {errors.password ? (
              <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
            ) : (
              <p className="text-gray-500 text-xs mt-1 ml-1">Must be at least 8 characters long.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-8 py-3.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300 hover:underline transition-all">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

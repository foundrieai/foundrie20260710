'use client';

import Link from 'next/link';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useGoogleSignIn, useEmailSignIn, useEmailSignUp, useResetPassword } from '@/firebase/auth';
import { Loader2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.94 11.04c0-.79-.07-1.54-.19-2.29h-8.75v4.38h4.94c-.21 1.41-.86 2.62-1.88 3.44v2.81h3.6c2.1-1.94 3.32-4.88 3.32-8.34z" fill="#4285F4"/>
      <path d="M12 21c2.43 0 4.47-.8 5.96-2.18l-3.6-2.81c-.8.54-1.83.86-2.36.86-1.88 0-3.48-1.26-4.05-2.95H4.26v2.89C5.74 19.43 8.64 21 12 21z" fill="#34A853"/>
      <path d="M7.95 14.05c-.17-.54-.26-1.11-.26-1.7s.09-1.16.26-1.7V7.76H4.26c-.78 1.54-1.26 3.25-1.26 5.14s.48 3.6 1.26 5.14l3.69-2.89z" fill="#FBBC05"/>
      <path d="M12 6.36c1.32 0 2.5.45 3.44 1.34l3.19-3.19C16.47 2.91 14.43 2 12 2 8.64 2 5.74 3.57 4.26 6.05l3.69 2.89c.57-1.69 2.17-2.95 4.05-2.95z" fill="#EA4335"/>
    </svg>
  );
}

const formSchema = z.object({
    name: z.string().optional(),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    rememberMe: z.boolean().optional(),
});


export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleGoogleSignIn = useGoogleSignIn();
  const emailSignIn = useEmailSignIn();
  const emailSignUp = useEmailSignUp();
  const resetPassword = useResetPassword();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (mode === 'login') {
      await emailSignIn(values.email, values.password, values.rememberMe ?? true);
    } else {
       if (!values.name) {
          form.setError("name", { type: "manual", message: "Name is required for sign up."});
          setIsLoading(false);
          return;
      }
      await emailSignUp(values.email, values.password, values.name);
    }
    setIsLoading(false);
  }

  async function handleForgotPassword() {
    const email = form.getValues('email');
    if (!email) {
      form.setError('email', { type: 'manual', message: 'Enter your email to receive a reset link.' });
      return;
    }
    setIsResetting(true);
    await resetPassword(email);
    setIsResetting(false);
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        className="w-full h-12 text-base"
        onClick={() => handleGoogleSignIn(form.getValues('rememberMe') ?? true)}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-sm text-muted-foreground">OR</span>
      </div>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'signup' && (
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                    </FormControl>
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox
                        id="show-password"
                        checked={showPassword}
                        onCheckedChange={(checked) => setShowPassword(checked === true)}
                      />
                      <label
                        htmlFor="show-password"
                        className="cursor-pointer select-none text-sm font-medium text-muted-foreground"
                      >
                        Show password
                      </label>
                    </div>
                    <FormMessage />
                </FormItem>
                )}
            />
            {mode === 'login' && (
              <div className="flex items-center justify-between gap-4">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm font-medium text-white/75">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-xs text-primary hover:underline"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base shadow-button-primary hover:shadow-button-primary-hover" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                {mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
        <Link href={mode === 'login' ? '/signup' : '/login'} className="text-primary hover:underline ml-1">
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </div>
  );
}

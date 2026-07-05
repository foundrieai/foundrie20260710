'use client';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export default function LoginPage() {
  useAuthRedirect();
  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to access your dashboard and reports."
      videoUrl="https://videos.files.wordpress.com/Ws1g0tw0/video-5.mp4"
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}

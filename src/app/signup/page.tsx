'use client';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export default function SignupPage() {
  useAuthRedirect();
  return (
    <AuthLayout
      title="Create an account"
      description="Start validating your ideas in minutes."
      videoUrl="https://videos.files.wordpress.com/Ws1g0tw0/video-5.mp4"
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}

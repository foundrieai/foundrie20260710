'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useResetPassword } from '@/firebase/auth';
import type { User as UserProfileData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, BarChart, FileText, Sparkles, Calendar, Key } from 'lucide-react';
import { useState, useEffect } from 'react';

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
      <div className="p-3 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="text-xl font-bold font-headline">{value}</p>
      </div>
    </div>
  );
}

export default function AdminUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const firestore = useFirestore();
  const { user } = useUser();
  const resetPassword = useResetPassword();
  const [isResetting, setIsResetting] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>('N/A');

  const userProfileRef = useMemoFirebase(() => {
    const isAdminUser = user?.email === 'hello@thesiliconhill.com' || user?.email === 'RobertKWilliams.DC@gmail.com' || (user as any)?.admin === true;
    if (!firestore || !user || !params.userId || (!isAdminUser && user.uid !== params.userId)) return null;
    return doc(firestore, 'users', params.userId);
  }, [firestore, user, params.userId]);

  const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfileData>(userProfileRef);

  useEffect(() => {
    if (userProfile?.createdAt) {
      // Safe date conversion to avoid hydration mismatches
      const date = new Date(userProfile.createdAt);
      if (!isNaN(date.getTime())) {
          setFormattedDate(date.toLocaleDateString());
      }
    }
  }, [userProfile]);

  const handleAdminResetPassword = async () => {
    if (!userProfile?.email) return;
    setIsResetting(true);
    await resetPassword(userProfile.email);
    setIsResetting(false);
  };

  if (isProfileLoading) {
    return (
      <main className="container py-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
      </main>
    );
  }

  if (!userProfile) {
    return (
        <main className="container py-12">
            <Button variant="ghost" asChild className="mb-8">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin Dashboard
                </Link>
            </Button>
            <Card className="glass-card max-w-3xl mx-auto p-8 text-center">
                <CardTitle className="text-2xl text-destructive">Profile Not Found</CardTitle>
                <CardContent className="pt-4">
                    <p className="text-muted-foreground">
                        Could not find a user profile document with ID: {params.userId}.
                        {error && ` Error: ${error.message}`}
                    </p>
                </CardContent>
            </Card>
        </main>
    );
  }

  const displayName = userProfile.displayName || 'N/A';
  const email = userProfile.email || 'N/A';
  const photoURL = userProfile.photoURL;
  const subscription = userProfile.subscription || 'free';
  const reportsGenerated = userProfile.reportsGenerated ?? 0;
  const reportsRemaining = userProfile.reportsRemaining ?? 0;

  return (
    <main className="container py-12">
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Dashboard
            </Link>
        </Button>
        <Card className="glass-card max-w-3xl mx-auto">
            <CardHeader className="text-center p-8">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src={photoURL ?? undefined} alt={displayName} data-ai-hint="person" />
                    <AvatarFallback className="text-3xl">
                        {displayName?.charAt(0) || email?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl">{displayName}</CardTitle>
                <CardDescription>{email}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <ProfileStat
                    icon={<Sparkles />}
                    label="Subscription Plan"
                    value={subscription.charAt(0).toUpperCase() + subscription.slice(1)}
                />
                <ProfileStat
                    icon={<BarChart />}
                    label="Reports Generated"
                    value={reportsGenerated}
                />
                <ProfileStat
                    icon={<FileText />}
                    label="Reports Remaining"
                    value={reportsRemaining}
                />
                <ProfileStat
                    icon={<Calendar />}
                    label="Member Since"
                    value={formattedDate}
                />
                </div>

                <div className="flex flex-col items-center gap-4 pt-6 border-t border-border/50">
                    <h3 className="text-lg font-bold font-headline">Administrative Actions</h3>
                    <Button 
                        variant="outline" 
                        onClick={handleAdminResetPassword} 
                        disabled={isResetting}
                        className="w-full max-w-xs"
                    >
                        {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                        Send Password Reset Email
                    </Button>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                        This will send an official Firebase password reset link to <strong>{email}</strong>.
                    </p>
                </div>
            </CardContent>
        </Card>
    </main>
  );
}
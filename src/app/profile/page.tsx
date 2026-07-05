'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserProfileData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart, FileText, Sparkles, Calendar } from 'lucide-react';

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

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [formattedDate, setFormattedDate] = useState<string>('N/A');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfileData>(userProfileRef);

  useEffect(() => {
    if (userProfile?.createdAt) {
      setFormattedDate(new Date(userProfile.createdAt).toLocaleDateString());
    }
  }, [userProfile]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
         <div className="min-h-screen bg-background">
            <main className="container py-12 text-center">
                 <Card className="glass-card max-w-3xl mx-auto p-8">
                    <CardTitle className="text-2xl text-destructive">Profile Not Found</CardTitle>
                    <CardContent className="pt-4">
                        <p className="text-muted-foreground">We couldn't find a profile document for your account. This can happen for older accounts.</p>
                         <p className="text-sm text-muted-foreground mt-2">Logged in as: {user.email}</p>
                    </CardContent>
                 </Card>
            </main>
        </div>
    )
  }

  const displayName = userProfile.displayName || user.displayName || 'Founder';
  const email = userProfile.email || user.email;
  const photoURL = userProfile.photoURL || user.photoURL;
  const subscription = userProfile.subscription || 'free';
  const reportsGenerated = userProfile.reportsGenerated ?? 0;
  const reportsRemaining = userProfile.reportsRemaining ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-12">
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
            <div className="flex justify-center gap-4">
              <Button disabled>Upgrade Plan</Button>
              <Button variant="outline" disabled>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
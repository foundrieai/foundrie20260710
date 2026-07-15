'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserProfileData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BarChart, FileText, Sparkles, Calendar, Camera } from 'lucide-react';

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
      <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="text-xl font-bold font-headline">{value}</p>
      </div>
    </div>
  );
}

/** Resize/crop an image file to a small square data URL — keeps avatars tiny (~15KB). */
async function resizeToDataUrl(file: File, size = 256): Promise<string> {
  const src: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error('Could not read the image.'));
    r.readAsDataURL(file);
  });
  const img: HTMLImageElement = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('Could not load the image.'));
    im.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image processing is not supported in this browser.');
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formattedDate, setFormattedDate] = useState<string>('N/A');
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) router.replace('/login');
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfileData>(userProfileRef);

  useEffect(() => {
    if (userProfile?.createdAt) setFormattedDate(new Date(userProfile.createdAt).toLocaleDateString());
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

  const displayName = userProfile?.displayName || user.displayName || 'Founder';
  const email = userProfile?.email || user.email;
  const photoURL = userProfile?.photoURL || user.photoURL;
  const subscription = userProfile?.subscription || 'free';
  const reportsGenerated = userProfile?.reportsGenerated ?? 0;
  const reportsRemaining = userProfile?.reportsRemaining ?? 0;

  const saveProfile = async (patch: Record<string, unknown>) => {
    if (!userProfileRef) return;
    // Firestore is the source of truth the app reads; also mirror to Auth where safe.
    await setDoc(userProfileRef, { ...patch, updatedAt: serverTimestamp() }, { merge: true });
  };

  const startEdit = () => {
    setNameDraft(displayName);
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    const name = nameDraft.trim();
    if (!name) {
      toast({ variant: 'destructive', title: 'Name required', description: 'Please enter a display name.' });
      return;
    }
    setIsSaving(true);
    try {
      await saveProfile({ displayName: name });
      try { await updateProfile(user, { displayName: name }); } catch { /* Auth mirror is best-effort */ }
      setIsEditing(false);
      toast({ title: 'Profile updated', description: 'Your display name has been saved.' });
    } catch {
      toast({ variant: 'destructive', title: 'Could not save', description: 'Please try again in a moment.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Not an image', description: 'Please choose a PNG, JPG, or GIF.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Image too large', description: 'Please choose an image under 8 MB.' });
      return;
    }
    setIsUploading(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      await saveProfile({ photoURL: dataUrl });
      try { await updateProfile(user, { photoURL: dataUrl }); } catch { /* Auth may reject long data URLs; Firestore drives the UI */ }
      toast({ title: 'Photo updated', description: 'Your profile image has been changed.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not update photo', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-12">
        <Card className="glass-card max-w-3xl mx-auto">
          <CardHeader className="text-center p-8">
            <div className="relative mx-auto mb-4 h-24 w-24">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={photoURL ?? undefined} alt={displayName} data-ai-hint="person" />
                <AvatarFallback className="text-3xl">
                  {displayName?.charAt(0) || email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition hover:opacity-90 disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {isEditing ? (
              <div className="mx-auto max-w-sm space-y-2">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Your name"
                  className="text-center text-lg"
                  autoFocus
                />
                <CardDescription>{email}</CardDescription>
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl">{displayName}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ProfileStat icon={<Sparkles />} label="Subscription Plan" value={subscription.charAt(0).toUpperCase() + subscription.slice(1)} />
              <ProfileStat icon={<BarChart />} label="Reports Generated" value={reportsGenerated} />
              <ProfileStat icon={<FileText />} label="Reports Remaining" value={reportsRemaining} />
              <ProfileStat icon={<Calendar />} label="Member Since" value={formattedDate} />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveName} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/pricing">Upgrade Plan</Link>
                  </Button>
                  <Button variant="outline" onClick={startEdit}>
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

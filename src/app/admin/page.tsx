'use client';

import { UsersTable } from "@/components/admin/users-table";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { User as UserProfileData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { platformTools } from "@/lib/platform";
import { isAdminUser } from "@/lib/entitlements";
import Link from "next/link";
import { User, BarChart3, FileText, ArrowRight, Database, ShieldCheck, Wrench } from "lucide-react";

function AdminStatCard({ title, value, icon, isLoading }: { title: string; value: string | number; icon: React.ReactNode, isLoading: boolean }) {
    return (
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-headline">
            {isLoading ? <Skeleton className="h-10 w-24" /> : value}
          </div>
        </CardContent>
      </Card>
    );
  }

export default function AdminPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const isAdminAccount = isAdminUser(user);

    // FIX 2: Guard query construction with authenticated user
    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !user || !isAdminAccount) return null;
        return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
    }, [firestore, user, isAdminAccount]);

    const { data: users, isLoading: isUsersLoading } = useCollection<UserProfileData>(usersQuery);

    const totalUsers = users?.length || 0;
    const proUsers = users?.filter(u => u.subscription === 'pro').length || 0;
    const totalReports = users?.reduce((acc, u) => acc + u.reportsGenerated, 0) || 0;
    const activeTools = platformTools.filter(tool => tool.status === 'live').length;

    return (
        <main className="container py-8">
            <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(244,241,246,0.075),rgba(244,241,246,0.025))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                <div className="relative p-6 md:p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(255,196,0,0.16),transparent_32%),radial-gradient(circle_at_100%_12%,rgba(230,0,201,0.16),transparent_36%)]" />
                    <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7a00]/35 bg-[#ff7a00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#ffc400]">
                                <ShieldCheck className="h-4 w-4" />
                                Platform Administration
                            </div>
                            <h1 className="text-4xl font-bold tracking-normal text-white md:text-6xl">Admin command center</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 md:text-base">
                                Manage platform access, inspect user activity, review generated data, and move across every Foundrie AI tool from one secure control surface.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-6 font-bold text-black hover:opacity-90">
                                <Link href="/dashboard">
                                    Back to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full border-white/20 bg-black/20 px-6 text-white hover:bg-white/10">
                                <Link href="/company/launchcode">Open LaunchCode</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <AdminStatCard title="Total Users" value={totalUsers} icon={<User className="h-4 w-4 text-muted-foreground" />} isLoading={isUsersLoading} />
                <AdminStatCard title="Pro Subscribers" value={proUsers} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} isLoading={isUsersLoading} />
                <AdminStatCard title="Reports Generated" value={totalReports} icon={<FileText className="h-4 w-4 text-muted-foreground" />} isLoading={isUsersLoading} />
                <AdminStatCard title="Live Tools" value={activeTools} icon={<Wrench className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
            </div>

            <Card className="glass-card mb-8 overflow-hidden">
                <CardHeader>
                    <CardTitle>Tool Access Matrix</CardTitle>
                    <CardDescription>Every active, incoming, and placeholder tool available to the platform administrator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {platformTools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                                <Link
                                    key={tool.name}
                                    href={tool.href}
                                    className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-1 hover:border-[#ff7a00]/50 hover:bg-white/[0.07]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-black/30 text-[#ffaf54]">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                                            {tool.status}
                                        </span>
                                    </div>
                                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/42">{tool.suite} / {tool.label}</p>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <h3 className="text-2xl font-bold tracking-normal text-white">{tool.name}</h3>
                                        <ArrowRight className="h-4 w-4 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card mb-8">
                <CardHeader>
                    <CardTitle>Data Operations</CardTitle>
                    <CardDescription>Core platform data surfaces for normal administrative review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Link href="/admin" className="rounded-xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-[#ff7a00]/45">
                            <User className="mb-4 h-5 w-5 text-[#ffaf54]" />
                            <h3 className="text-xl font-bold text-white">Users</h3>
                            <p className="mt-2 text-sm text-white/55">Profiles, subscriptions, reports, and account-level review.</p>
                        </Link>
                        <Link href="/vault" className="rounded-xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-[#ff7a00]/45">
                            <Database className="mb-4 h-5 w-5 text-[#ff6f9f]" />
                            <h3 className="text-xl font-bold text-white">Evidence Vault</h3>
                            <p className="mt-2 text-sm text-white/55">Founder-submitted evidence, validation inputs, and supporting artifacts.</p>
                        </Link>
                        <Link href="/decisions" className="rounded-xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-[#ff7a00]/45">
                            <FileText className="mb-4 h-5 w-5 text-[#ffc400]" />
                            <h3 className="text-xl font-bold text-white">Decision Logs</h3>
                            <p className="mt-2 text-sm text-white/55">Founder decisions, rationale, and milestone traceability.</p>
                        </Link>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>A list of all users in the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isUsersLoading && <Skeleton className="h-64 w-full" />}
                    {users && <UsersTable users={users} />}
                </CardContent>
            </Card>

        </main>
    );
}

'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Report } from '@/lib/types';
import { calculateOverallScore } from '@/lib/report-helpers';
import { format, parseISO } from 'date-fns';
import { Eye, Download, Trash2, AlertTriangle, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useDeleteReport } from '@/firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useUser, useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
    const deleteReport = useDeleteReport();
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isPromoting, setIsPromoting] = useState(false);

    const isOwner = currentUser?.uid === report.userId;
    const overallScore = calculateOverallScore(report.scores).toFixed(1);
    
    const handleTogglePromote = async () => {
      if (!isOwner || !firestore || !currentUser) return;
      setIsPromoting(true);
      try {
        const reportRef = doc(firestore, 'users', currentUser.uid, 'reports', report.id);
        const promotedRef = doc(firestore, 'promotedReports', report.id);
        const newPromoteStatus = !report.isPromoted;

        if (newPromoteStatus) {
            // Write to BOTH private and public collections
            await updateDoc(reportRef, { isPromoted: true });
            await setDoc(promotedRef, {
                ...report,
                isPromoted: true,
                updatedAt: new Date().toISOString()
            });
        } else {
            // Remove from BOTH private and public collections
            await updateDoc(reportRef, { isPromoted: false });
            await deleteDoc(promotedRef);
        }

        toast({
          title: newPromoteStatus ? "Idea Promoted!" : "Promotion Removed",
          description: newPromoteStatus 
            ? "Your idea is now featured on the homepage scrolling gallery."
            : "Your idea has been removed from the homepage gallery."
        });
      } catch (error) {
        console.error("Promotion toggle failed:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not update promotion status." });
      } finally {
        setIsPromoting(false);
      }
    };

    const getScoreContent = () => {
        if (report.status === 'generating') return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
        if (report.status === 'error') return <AlertTriangle className="h-5 w-5 text-destructive" />;
        if (report.scores) return overallScore;
        return '-';
    }

    const getStatusBadge = () => {
      switch(report.status) {
        case 'generating':
          return <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse"><Sparkles className="mr-1 h-3 w-3" /> Generating</Badge>;
        case 'error':
          return <Badge variant="destructive">Error</Badge>;
        default:
          return report.isPromoted ? <Badge variant="default" className="bg-accent text-accent-foreground"><TrendingUp className="mr-1 h-3 w-3" /> Promoted</Badge> : null;
      }
    }

  return (
    <Card className={cn("glass-card flex flex-col h-full transition-all hover:border-primary/30", report.status === 'generating' && "border-primary/50")}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary">{report.industry}</Badge>
                  {getStatusBadge()}
                </div>
                <CardTitle className="text-xl font-bold font-headline line-clamp-2">{report.companyName}</CardTitle>
            </div>
            <div className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-primary bg-primary/10 font-code text-lg font-bold text-primary-foreground flex-shrink-0 ml-4">
                {getScoreContent()}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="line-clamp-3">{report.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 mt-auto">
        <p className="text-xs text-muted-foreground">
          Created on {format(parseISO(report.createdAt), 'MMM d, yyyy')}
        </p>
        <div className="flex w-full justify-between items-center">
            <div className="flex gap-2">
              <Button variant="default" size="sm" asChild className="shadow-button-primary hover:shadow-button-primary-hover">
                  <Link href={`/report/${report.userId}/${report.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View
                  </Link>
              </Button>
              {isOwner && report.status === 'complete' && (
                <Button 
                  variant={report.isPromoted ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={handleTogglePromote}
                  disabled={isPromoting}
                >
                  {isPromoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  {report.isPromoted ? "Unpromote" : "Promote Idea"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-destructive/20 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your validation
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteReport(report.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}

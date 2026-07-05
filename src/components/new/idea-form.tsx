
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { industries, stages, Report } from '@/lib/types';
import { Bot, Loader2, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, query, where, getDocs, limit } from 'firebase/firestore';
import { generateNameAndTagline } from '@/ai/flows/generate-startup-validation-report';

const formSchema = z.object({
  companyName: z.string().optional(),
  description: z.string().min(100, {
    message: 'Please provide a more detailed description (at least 100 characters) for a high-quality analysis.',
  }),
  industry: z.string().optional(),
  targetMarket: z.string().optional(),
  location: z.string().optional(),
  stage: z.enum(['Idea', 'MVP', 'Beta', 'Revenue-generating'], {
    required_error: 'You need to select a project stage.',
  }),
});

function IdeaFormInner() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      description: '',
      targetMarket: '',
      location: '',
      stage: 'Idea',
    },
  });

  const mappedInitialValues = useRef(false);

  useEffect(() => {
    if (searchParams && !mappedInitialValues.current) {
      const companyName = searchParams.get('companyName');
      const description = searchParams.get('description');
      const targetMarket = searchParams.get('targetMarket');

      if (companyName) form.setValue('companyName', companyName);
      if (description) form.setValue('description', description);
      if (targetMarket) form.setValue('targetMarket', targetMarket);
      
      mappedInitialValues.current = true;
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to validate an idea.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const reportsCollection = collection(firestore, 'users', user.uid, 'reports');
      let existingReportId = null;

      // 1. Check for duplicates by description prefix
      const descriptionPrefix = values.description.substring(0, 300);
      const qDesc = query(
        reportsCollection, 
        where('description', '>=', descriptionPrefix), 
        where('description', '<=', descriptionPrefix + '\uf8ff'), 
        limit(1)
      );
      const descDocs = await getDocs(qDesc);
      if (!descDocs.empty) {
        existingReportId = descDocs.docs[0].id;
      }

      // 2. Also check for duplicates by exact Company Name if provided
      if (!existingReportId && values.companyName) {
        const qName = query(
          reportsCollection,
          where('companyName', '==', values.companyName),
          limit(1)
        );
        const nameDocs = await getDocs(qName);
        if (!nameDocs.empty) {
          existingReportId = nameDocs.docs[0].id;
        }
      }

      if (existingReportId) {
        toast({
          title: 'Existing Report Found',
          description: 'Redirecting you to your existing validation for this idea.',
        });
        router.push(`/report/${user.uid}/${existingReportId}`);
        return;
      }

      // Generate name and tagline via AI if company name is not provided
      toast({
        title: 'Generating creative assets...',
        description: 'Our AI is crafting a name and tagline for your idea.',
      });
      const nameAndTagline = await generateNameAndTagline(values.description);
      
      const companyName = values.companyName || nameAndTagline.companyName;
      const tagline = nameAndTagline.tagline;

      const newReport: Omit<Report, 'id' | 'scores'> = {
        userId: user.uid,
        companyName: companyName,
        description: values.description,
        industry: values.industry || "",
        targetMarket: values.targetMarket,
        location: values.location,
        stage: values.stage,
        status: 'draft',
        tagline: tagline,
        content: {
            purpose: '',
            problem: '',
            solution: '',
            whyNow: '',
            marketSize: '',
            competition: '',
            productRoadmap: '',
            businessModel: '',
            traction: '',
            team: '',
            financials: '',
            risks: '',
            actionPlan: '',
            sources: '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(reportsCollection, newReport);

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        reportsGenerated: increment(1)
      });

      toast({
        title: 'Idea Submitted!',
        description: 'Redirecting to the validation page...',
      });
      
      router.push(`/report/${user.uid}/${docRef.id}`);

    } catch (error: any) {
      console.error('Failed to create report:', error);
      toast({
        variant: 'destructive',
        title: 'Error Submitting Idea',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="glass-card p-6 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Leave blank for an AI suggestion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe Your Startup Idea</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain what your company does, who it serves, and how it creates value..."
                    className="min-h-[160px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The more detail you provide, the better the analysis will be.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry / Sector</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Headquarters</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input 
                        placeholder="e.g., Austin, TX or Remote" 
                        className="pl-10 bg-background/50 backdrop-blur-sm border-white/10"
                        {...field} 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-bold">{">"}</div>
                    </div>
                  </FormControl>
                  <FormDescription>Optional: Enables Hyperlocal Intelligence Audit.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="targetMarket"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Market (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Small businesses in the US, Enterprise healthcare providers" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Current Stage</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {stages.map((stage) => (
                      <div key={stage}>
                         <RadioGroupItem value={stage} id={stage} className="sr-only peer" />
                         <Label
                          htmlFor={stage}
                          className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                        >
                          {stage}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full shadow-button-primary hover:shadow-button-primary-hover" disabled={isSubmitting || !user}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Processing...' : 'Validate Idea'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}

export function IdeaForm() {
  return (
    <Suspense fallback={null}>
      <IdeaFormInner />
    </Suspense>
  );
}

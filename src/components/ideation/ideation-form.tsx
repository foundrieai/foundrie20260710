'use client';

import { useState, useId, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateIdeationConcepts, extractFounderProfile, isIdeationAIConfigured, FounderProfile } from '@/ai/flows/generate-ideation-concepts';
import { processFile } from '@/lib/file-processor';
import { Loader2, Sparkles, Upload, UserPlus, Trash2, RotateCcw, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { IdeaCard } from './idea-card';
import { ProcessingFlame } from '@/components/shared/processing-flame';
import { Idea } from '@/lib/types';

type FounderData = {
  id: string;
  activeTab: string;
  fileName: string;
  fileText: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
};

const createEmptyFounder = (): FounderData => ({
  id: crypto.randomUUID(),
  activeTab: 'resume',
  fileName: '',
  fileText: '',
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: '',
});

// Minimum thresholds for input to count as "sufficient" to build a real profile.
const MIN_RESUME_CHARS = 80;
const MIN_QUESTIONNAIRE_CHARS = 40;
const MIN_DISTINCT_CHARS = 6; // rejects filler like "xxxx xxxx xxxx"

const normalize = (text: string) => (text || '').replace(/\s+/g, ' ').trim();
const distinctAlnum = (text: string) => new Set(text.toLowerCase().replace(/[^a-z0-9]/g, '')).size;
const looksMeaningful = (text: string, minLen: number) =>
  normalize(text).length >= minLen && distinctAlnum(text) >= MIN_DISTINCT_CHARS;

/**
 * Confirms each founder has genuinely sufficient input (a readable resume/LinkedIn
 * file, or a fully and meaningfully completed questionnaire). Returns the first
 * problem found so the UI can notify the user and refuse to generate ideas.
 */
function validateFounders(founders: FounderData[]): { ok: boolean; message?: string } {
  if (!founders.length) {
    return { ok: false, message: 'Add at least one founder before generating ideas.' };
  }
  for (let i = 0; i < founders.length; i++) {
    const f = founders[i];
    const who = founders.length > 1 ? `Founder ${i + 1}` : 'This founder';

    if (f.activeTab === 'resume' || f.activeTab === 'linkedin') {
      const source = f.activeTab === 'resume' ? 'resume' : 'LinkedIn PDF';
      const text = normalize(f.fileText);
      if (!text) {
        return { ok: false, message: `${who}: upload a ${source}, or switch to the Quick Questionnaire, before generating ideas.` };
      }
      if (!looksMeaningful(text, MIN_RESUME_CHARS)) {
        return { ok: false, message: `${who}: the ${source} does not contain enough readable text to build a founder profile. Upload a text-based file or complete the questionnaire instead.` };
      }
    } else {
      const answers = [f.q1, f.q2, f.q3, f.q4, f.q5].map((a) => normalize(a));
      if (answers.some((a) => !a)) {
        return { ok: false, message: `${who}: answer all five questionnaire questions (or upload a resume / LinkedIn PDF) before generating ideas.` };
      }
      const combined = answers.join(' ');
      if (!looksMeaningful(combined, MIN_QUESTIONNAIRE_CHARS)) {
        return { ok: false, message: `${who}: the questionnaire answers do not contain enough real detail to build a founder profile. Please describe your actual skills, industries, and background.` };
      }
    }
  }
  return { ok: true };
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground border-b pb-2">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm flex items-start gap-2">
            <span className="text-primary mt-1">•</span> <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IdeationForm() {
  const fieldUid = useId();
  const [founders, setFounders] = useState<FounderData[]>([createEmptyFounder()]);
  const [stage, setStage] = useState<'input' | 'configuring' | 'results'>('input');
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [founderProfile, setFounderProfile] = useState<FounderProfile | null>(null);
  
  const [creativityLevel, setCreativityLevel] = useState<number>(3); // 1 to 5
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Idea[]>([]);
  const [targetBusinessModel, setTargetBusinessModel] = useState('B2B');

  // Any AI request in flight. Drives the always-visible processing indicator so
  // a user never wonders whether their click registered.
  const isBusy = isExtracting || isGenerating;
  const topRef = useRef<HTMLDivElement>(null);

  // When the stage changes, bring the user to the top of the new view rather
  // than leaving them stranded at the bottom where the button they clicked was.
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stage]);

  // Any change to founder input must discard a previously extracted profile so a
  // stale/cached profile can never drive idea generation. Guarded so it is a
  // no-op during normal editing (when there is nothing cached yet).
  const invalidateProfile = () => {
    if (founderProfile !== null || results.length > 0 || stage !== 'input') {
      setFounderProfile(null);
      setResults([]);
      setStage('input');
    }
  };

  const handleFounderChange = (id: string, field: keyof FounderData, value: string) => {
    setFounders(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    invalidateProfile();
  };

  const addFounder = () => {
    setFounders(prev => [...prev, createEmptyFounder()]);
    invalidateProfile();
  };

  const removeFounder = (id: string) => {
    setFounders(prev => prev.filter(f => f.id !== id));
    invalidateProfile();
  };

  const handleReset = () => {
    setFounders([createEmptyFounder()]);
    setStage('input');
    setFounderProfile(null);
    setResults([]);
    setCreativityLevel(3);
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFounderChange(id, 'fileName', file.name);
    handleFounderChange(id, 'fileText', '');

    const result = await processFile(file);
    if (result.extractionStatus === 'success' && result.extractedText) {
      handleFounderChange(id, 'fileText', result.extractedText);
      toast({ title: 'File processed', description: `Extracted text from ${file.name}.` });
    } else {
      handleFounderChange(id, 'fileName', '');
      toast({
        variant: 'destructive',
        title: 'Could not read that file',
        description: result.error || 'Please try a PDF, Word, or TXT file, or use the Quick Questionnaire.',
      });
    }
    // Allow re-selecting the same file after an error.
    e.target.value = '';
  };

  const handleExtractProfile = async () => {
    // Never proceed without genuinely sufficient input. Notify and stop.
    const validation = validateFounders(founders);
    if (!validation.ok) {
      setFounderProfile(null);
      toast({
        variant: 'destructive',
        title: 'Not enough information to proceed',
        description: validation.message,
      });
      return;
    }

    setIsExtracting(true);

    try {
      const aiConfigured = await isIdeationAIConfigured();
      if (!aiConfigured) {
        toast({
          variant: 'destructive',
          title: 'Gemini key required',
          description: 'Add GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY to run Ideation locally.',
        });
        return;
      }

      let combinedProfileText = '';

      for (let i = 0; i < founders.length; i++) {
        const f = founders[i];
        let profileText = '';
        if (f.activeTab === 'resume' || f.activeTab === 'linkedin') {
          profileText = f.fileText;
        } else {
          profileText = `
            What comes easily: ${f.q1}
            Industries understood: ${f.q2}
            Problems hit: ${f.q3}
            Time and money commitment: ${f.q4}
            Unique access: ${f.q5}
          `;
        }
        combinedProfileText += `\n\n--- Founder ${i + 1} Profile ---\n${profileText}`;
      }

      toast({
        title: 'Extracting Profile...',
        description: 'Analyzing inputs to build a core skills graph.',
      });

      const profile = await extractFounderProfile({
        profileText: combinedProfileText.trim(),
        founderCount: founders.length,
      });
      setFounderProfile(profile);
      setStage('configuring');
      
      toast({
        title: 'Profile Extracted!',
        description: 'Review your skill graph and set creativity configuration.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error extracting profile',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateIdeas = async (append = false) => {
    // Re-check the current input still qualifies, and require a profile that was
    // freshly extracted from it — no cached profile may ever drive generation.
    const validation = validateFounders(founders);
    if (!validation.ok || !founderProfile) {
      setFounderProfile(null);
      setStage('input');
      toast({
        variant: 'destructive',
        title: 'Not enough information to proceed',
        description: validation.message || 'Add a resume, LinkedIn profile, or a completed questionnaire, then extract competencies before generating ideas.',
      });
      return;
    }

    setIsGenerating(true);
    if (!append) {
      setResults([]);
      setStage('results');
    }

    try {
      const aiConfigured = await isIdeationAIConfigured();
      if (!aiConfigured) {
        toast({
          variant: 'destructive',
          title: 'Gemini key required',
          description: 'Add GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY to run Ideation locally.',
        });
        if (!append) {
          setStage('configuring');
        }
        return;
      }

      toast({
        title: append ? 'Exploring More Ideas...' : 'Synthesizing Market Opportunities...',
        description: 'Running concepts through ideation engine.',
      });

      const generatedIdeas = await generateIdeationConcepts({ 
        founderProfile, 
        creativityLevel 
      });
      
      const mappedIdeas: Idea[] = generatedIdeas.map(idea => ({
        ...idea,
        isBookmarked: false,
      }));
      
      setResults(prev => append ? [...prev, ...mappedIdeas] : mappedIdeas);
      
      toast({
        title: 'Success!',
        description: 'Generated startup concepts.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error generating ideas',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={topRef} className="space-y-8 w-full max-w-4xl mx-auto">
      {/* Always-visible "AI is working" indicator, pinned so it stays in view no
          matter where the user has scrolled. */}
      {isBusy && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center rounded-full border border-white/12 bg-[#0c0912]/92 px-5 py-3 shadow-2xl backdrop-blur-xl">
            <ProcessingFlame
              label={isExtracting ? 'Analyzing founder profiles' : 'Synthesizing opportunities'}
              sublabel="This can take a few moments"
            />
          </div>
        </div>
      )}
      <div className="flex justify-end mb-4 space-x-4">
        <Button variant="outline" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Forms
        </Button>
      </div>

      {stage === 'input' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-card p-6 md:p-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Target Business Model</Label>
              <Select value={targetBusinessModel} onValueChange={setTargetBusinessModel}>
                <SelectTrigger className="w-full text-base py-4">
                  <SelectValue placeholder="Select Target Business Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B2C">B2B2C</SelectItem>
                  <SelectItem value="Marketplace">Marketplace</SelectItem>
                  <SelectItem value="Services First">Services First</SelectItem>
                  <SelectItem value="Public Sector / GovCon">Public Sector / GovCon</SelectItem>
                  <SelectItem value="Let LaunchCode Decide">Let LaunchCode Decide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {founders.map((founder, index) => (
            <Card key={founder.id} className="glass-card p-6 md:p-8 relative">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold font-headline">Founder {index + 1}</h3>
                  {founders.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeFounder(founder.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
               </div>

              <Tabs value={founder.activeTab} onValueChange={(val) => handleFounderChange(founder.id, 'activeTab', val)} className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto mb-8">
                  <TabsTrigger value="resume" className="py-3">Upload Resume</TabsTrigger>
                  <TabsTrigger value="linkedin" className="py-3">Upload LinkedIn PDF</TabsTrigger>
                  <TabsTrigger value="questionnaire" className="py-3">Quick Questionnaire</TabsTrigger>
                </TabsList>

                <TabsContent value="resume" className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-background/50 hover:bg-accent/50 transition-colors">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <Label htmlFor={`resume-upload-${fieldUid}-${index}`} className="cursor-pointer text-center">
                      <span className="text-primary font-medium">Click to upload</span> or drag and drop
                      <br />
                      <span className="text-sm text-muted-foreground mt-1 block">PDF, Word, ODT, RTF, or TXT (Max 5MB)</span>
                    </Label>
                    <Input 
                      id={`resume-upload-${fieldUid}-${index}`} 
                      type="file" 
                      accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.md"
                      className="hidden" 
                      onChange={(e) => handleFileUpload(founder.id, e)} 
                    />
                  </div>
                  {founder.fileName && <p className="text-sm text-center text-muted-foreground">Attached: <span className="text-foreground font-medium">{founder.fileName}</span></p>}
                </TabsContent>

                <TabsContent value="linkedin" className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-background/50 hover:bg-accent/50 transition-colors">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <Label htmlFor={`linkedin-upload-${fieldUid}-${index}`} className="cursor-pointer text-center">
                      <span className="text-primary font-medium">Click to upload</span> LinkedIn Profile PDF
                      <br />
                      <span className="text-sm text-muted-foreground mt-1 block">Go to your LinkedIn profile {'>'} More {'>'} Save to PDF</span>
                    </Label>
                    <Input 
                      id={`linkedin-upload-${fieldUid}-${index}`} 
                      type="file" 
                      accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.md"
                      className="hidden" 
                      onChange={(e) => handleFileUpload(founder.id, e)} 
                    />
                  </div>
                  {founder.fileName && <p className="text-sm text-center text-muted-foreground">Attached: <span className="text-foreground font-medium">{founder.fileName}</span></p>}
                </TabsContent>

                <TabsContent value="questionnaire" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`q1-${fieldUid}-${index}`}>1. What do people regularly ask for your help with, or what comes easily to you that others find hard?</Label>
                      <Textarea id={`q1-${fieldUid}-${index}`} value={founder.q1} onChange={e => handleFounderChange(founder.id, 'q1', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`q2-${fieldUid}-${index}`}>2. What industries, communities, or customers do you understand better than most?</Label>
                      <Textarea id={`q2-${fieldUid}-${index}`} value={founder.q2} onChange={e => handleFounderChange(founder.id, 'q2', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`q3-${fieldUid}-${index}`}>3. What problems or frustrations have you hit that made you think "someone should fix this"?</Label>
                      <Textarea id={`q3-${fieldUid}-${index}`} value={founder.q3} onChange={e => handleFounderChange(founder.id, 'q3', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`q4-${fieldUid}-${index}`}>4. How much time and money can you commit this year, and do you need income quickly or can the business grow slowly?</Label>
                      <Textarea id={`q4-${fieldUid}-${index}`} value={founder.q4} onChange={e => handleFounderChange(founder.id, 'q4', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`q5-${fieldUid}-${index}`}>5. Beyond your skills, what access do you have that most people do not - an audience, a network, a community, capital, equipment, or inside knowledge?</Label>
                      <Textarea id={`q5-${fieldUid}-${index}`} value={founder.q5} onChange={e => handleFounderChange(founder.id, 'q5', e.target.value)} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ))}

          <div className="flex flex-col space-y-4 pt-4">
            <Button variant="outline" onClick={addFounder} className="w-full border-dashed py-8 border-2 text-muted-foreground hover:text-foreground">
              <UserPlus className="mr-2 h-5 w-5" /> Add Additional Founder
            </Button>

            <Button 
              onClick={() => handleExtractProfile()} 
              disabled={isExtracting} 
              size="lg" 
              className="w-full shadow-button-primary hover:shadow-button-primary-hover py-8 text-lg"
            >
              {isExtracting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Brain className="mr-2 h-6 w-6" />}
              {isExtracting ? 'Analyzing Profiles...' : 'Extract Core Competencies'}
            </Button>
          </div>
        </div>
      )}

      {stage === 'configuring' && founderProfile && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-card overflow-hidden border-2 border-primary/20">
            <div className="bg-primary/5 p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <CheckCircle2 className="text-primary h-6 w-6" />
                Founder Alignment Report
              </h2>
              {founderProfile.founders.length > 1 && (
                <p className="text-sm font-medium text-primary mt-2">
                  Founding team of {founderProfile.founders.length}
                </p>
              )}
              <p className="text-muted-foreground mt-2">{founderProfile.summary}</p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Each founder is reported individually so no one is collapsed into the team view. */}
              {founderProfile.founders.length > 1 && (
                <div className="space-y-4">
                  {founderProfile.founders.map((f, i) => (
                    <div key={i} className="rounded-lg border border-border/50 bg-background/40 p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold font-headline">
                          {f.name?.trim() || f.label || `Founder ${i + 1}`}
                        </h3>
                        {f.name?.trim() && (
                          <p className="text-xs text-muted-foreground">{f.label || `Founder ${i + 1}`}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{f.summary}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BulletList title="Core Skills" items={f.coreSkills} />
                        <BulletList title="Industry Expertise" items={f.industryExpertise} />
                      </div>
                      <BulletList title="Unfair Advantages" items={f.unfairAdvantages} />
                    </div>
                  ))}
                </div>
              )}

              <div
                className={
                  founderProfile.founders.length > 1
                    ? 'space-y-6 pt-6 border-t-2 border-primary/20'
                    : 'space-y-6'
                }
              >
                {founderProfile.founders.length > 1 && (
                  <h3 className="text-xl font-bold font-headline">Combined Team Profile</h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BulletList title="Core Skills" items={founderProfile.coreSkills} />
                  <BulletList title="Industry Expertise" items={founderProfile.industryExpertise} />
                </div>
                <div className="pt-4 border-t border-border/50">
                  <BulletList title="Unfair Advantages / Unique Insights" items={founderProfile.unfairAdvantages} />
                </div>
                {founderProfile.complementarity?.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <BulletList title="How These Founders Reinforce Each Other" items={founderProfile.complementarity} />
                  </div>
                )}
                {founderProfile.teamGaps?.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <BulletList title="Capability Gaps to Cover" items={founderProfile.teamGaps} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card p-6 md:p-8">
             <CardHeader className="px-0 pt-0">
               <CardTitle className="text-2xl font-headline">Creativity Gauge</CardTitle>
               <p className="text-muted-foreground pt-2">
                 Adjust the AI's boundaries. Low creativity generates safe, standard SaaS models. High creativity explores cross-domain moonshots based heavily on your unfair advantages.
               </p>
             </CardHeader>
             
             <div className="py-8 px-2 space-y-8">
               <Slider 
                  value={[creativityLevel]} 
                  onValueChange={(val) => setCreativityLevel(val[0])} 
                  max={5} 
                  min={1} 
                  step={1} 
                  className="w-full"
               />
               <div className="flex justify-between text-sm font-medium text-muted-foreground">
                 <span className={creativityLevel === 1 ? "text-primary" : ""}>Safe / Validated</span>
                 <span className={creativityLevel === 3 ? "text-primary" : ""}>Balanced</span>
                 <span className={creativityLevel === 5 ? "text-primary" : ""}>Visionary / Moonshot</span>
               </div>
               
               <div className="bg-accent/30 p-4 rounded-md border border-accent">
                 <span className="font-semibold block mb-1">Impact:</span>
                 {creativityLevel === 1 && "Focuses strictly on well-understood horizontal pain points and traditional SaaS business models."}
                 {creativityLevel === 2 && "Explores proven SaaS solutions anchored deeply within your specific domain expertise."}
                 {creativityLevel === 3 && "Balances safety with uncrowded niches and systemic inefficiencies adjacent to your domain."}
                 {creativityLevel === 4 && "Explores non-obvious cross-domain combinations and deep technical moats pushing your unfair advantage."}
                 {creativityLevel === 5 && "Audacious, category-defining B2B moonshots that aggressively leverage your unfair advantage to disrupt stagnant industries."}
               </div>
             </div>
             
             <Button 
                onClick={() => handleGenerateIdeas(false)} 
                disabled={isGenerating} 
                size="lg" 
                className="w-full shadow-button-primary hover:shadow-button-primary-hover py-8 text-lg"
              >
                {isGenerating ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                {isGenerating ? 'Synthesizing Market Opportunities...' : 'Generate Startup Ideas'}
                {!isGenerating && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
          </Card>
        </div>
      )}

      {stage === 'results' && results.length > 0 && (
        <div className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
             <h2 className="text-3xl font-bold font-headline">Your Concept Pipeline</h2>
             <p className="text-muted-foreground mt-2">{results.length} High-potential B2B SaaS opportunities tailored to your expertise.</p>
          </div>
          {results.map((idea, index) => (
            <IdeaCard key={index} idea={idea} founderProfile={founderProfile} />
          ))}
          <div className="pt-8 flex flex-col gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full py-8 border-dashed border-2 hover:bg-accent/50 text-lg"
              onClick={() => handleGenerateIdeas(true)}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {isGenerating ? 'Generating more...' : 'Generate Alternative Ideas'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Choose one concept above and select Validate This Idea to continue to Validation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

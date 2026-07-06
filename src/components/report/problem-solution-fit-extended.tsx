"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Users, 
  AlertTriangle, 
  Globe, 
  CreditCard, 
  BarChart3, 
  CheckSquare, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export function ProblemSolutionFitExtended({ Context }: { Context?: any }) {
  const [phaseState, setPhaseState] = useState<'problem_solution_fit' | 'product_market_fit'>('problem_solution_fit');
  const [mvpItems, setMvpItems] = useState([
    { id: '1', text: 'Core value proposition workflow', checked: true },
    { id: '2', text: 'Basic user authentication', checked: true },
    { id: '3', text: 'Payment gateway integration', checked: false },
    { id: '4', text: 'Data export functionality', checked: false },
    { id: '5', text: 'Onboarding tutorial', checked: false },
  ]);

  const toggleMvpItem = (id: string) => {
    setMvpItems(items => 
      items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedMvpItems = mvpItems.filter(i => i.checked).length;
  const mvpProgress = Math.round((completedMvpItems / mvpItems.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. GOAL & CONTEXT DISPLAY */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-800 p-6 text-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-[#ff7a00]" />
            <h2 className="text-xl font-bold tracking-tight">Phase 3: Problem-Solution Fit Validation</h2>
          </div>
          <p className="text-slate-300 font-medium text-lg pt-2 leading-relaxed">
            Validate that your proposed solution meaningfully solves a real, urgent, and valuable problem for a specific customer segment.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. DISCOVERY & HYPOTHESIS VALIDATION DASHBOARD */}
        
        {/* Ideal Customer Profile (ICP) */}
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Ideal Customer Profile (ICP)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-grow flex items-center justify-center p-8 bg-slate-50/50">
            <p className="text-lg text-slate-700 text-center font-medium italic border-l-4 border-indigo-400 pl-4 py-2">
              "Mid-market compliance managers who spend 10+ hours a week manually cross-referencing changing EU regulations via spreadsheets."
            </p>
          </CardContent>
        </Card>

        {/* Structured Customer Discovery Tracking */}
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#ffc400]" />
              Customer Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-slate-600">Interviews Completed</span>
                <span className="text-slate-900">32 / 50</span>
              </div>
              <Progress value={64} className="h-2 bg-slate-100" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="block text-2xl font-bold text-red-600 mb-1">28</span>
                <span className="text-xs font-semibold text-red-800 uppercase tracking-tight">Active<br/>Workarounds</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <span className="block text-2xl font-bold text-amber-600 mb-1">14</span>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-tight">Urgent<br/>Triggers</span>
              </div>
              <div className="bg-[#ff7a00]/10 p-3 rounded-lg border border-[#ff7a00]/25">
                <span className="block text-2xl font-bold text-[#ffc400] mb-1">$50k</span>
                <span className="text-xs font-semibold text-[#ffc400] uppercase tracking-tight">Existing<br/>Budget Flow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hypothesis Prioritization & Risk Matrix */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Hypothesis Prioritization & Risk Matrix
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="w-[300px]">Fatal Assumption</TableHead>
                  <TableHead>Failure Impact</TableHead>
                  <TableHead>Validation Method</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Users are willing to upload sensitive data to a cloud tool</TableCell>
                  <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
                  <TableCell className="text-slate-600">Compliance workflow prototype</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="bg-[#ff7a00]/10 text-[#ffc400] border-[#ff7a00]/30">Validated</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Managers have authority to purchase tools under $500/mo</TableCell>
                  <TableCell><Badge variant="destructive" className="bg-orange-500">High</Badge></TableCell>
                  <TableCell className="text-slate-600">Letter of Intent signatures</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Testing</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Integration with existing ERP is immediately necessary</TableCell>
                  <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
                  <TableCell className="text-slate-600">Waitlist prioritization quiz</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="text-slate-500">Invalidated</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Landing Page & Messaging Validation */}
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ff7a00]" />
              Landing Page & Messaging
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
              <div>
                <p className="font-medium text-sm text-slate-800">Positioning A: Time-Saving</p>
                <p className="text-xs text-slate-500 mt-0.5">Fake-door CTR</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">4.2%</p>
                <Badge variant="outline" className="mt-1 border-[#ff7a00]/30 text-[#ffc400] bg-[#ff7a00]/10 text-[10px]">Winner</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm opacity-60">
              <div>
                <p className="font-medium text-sm text-slate-800">Positioning B: Risk Reduction</p>
                <p className="text-xs text-slate-500 mt-0.5">Fake-door CTR</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">1.8%</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium text-slate-700 mb-1">Total Waitlist Signups</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">142</span>
                <span className="text-sm text-[#ffc400] font-medium mb-1">+12 this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Willingness-to-Pay Tracker */}
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Willingness-to-Pay Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-[#ff7a00]/10 border-[#ff7a00]/25 flex items-start gap-4">
                <div className="bg-[#ff7a00]/15 p-2 rounded-full mt-0.5">
                  <CheckSquare className="w-4 h-4 text-[#ffc400]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#ffc400] text-sm">Signed Letters of Intent</h4>
                  <p className="text-2xl font-bold text-[#ffc400] mt-1">4 <span className="text-sm font-normal text-[#ffc400]">/ 5 Target</span></p>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-[#ff3000]/10 border-[#ff3000]/25 flex items-start gap-4">
                <div className="bg-[#ff3000]/15 p-2 rounded-full mt-0.5">
                  <ArrowRight className="w-4 h-4 text-[#ff7a00]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#ff7a00] text-sm">Pilot Pipeline Deposits</h4>
                  <p className="text-2xl font-bold text-[#ff7a00] mt-1">$2,500 <span className="text-sm font-normal text-[#ff7a00]">collected</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom-Up Market Refinement */}
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              Bottom-Up Market Refinement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-0 overflow-hidden">
            <Table>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-4 px-6">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Addressable Market (TAM)</p>
                    <p className="font-medium text-slate-900">All compliance managers globally</p>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <span className="text-lg font-bold text-slate-700">$4.2B</span>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent bg-slate-50/50">
                  <TableCell className="py-4 px-6">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Serviceable Addressable Market (SAM)</p>
                    <p className="font-medium text-slate-900">US/EU tech mid-market</p>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <span className="text-lg font-bold text-slate-700">$850M</span>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent bg-[#ff3000]/10">
                  <TableCell className="py-4 px-6">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Serviceable Obtainable Market (SOM)</p>
                    <p className="font-medium text-slate-900">Fintech compliance (Year 1-3 focus)</p>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <span className="text-xl font-bold text-[#ff7a00]">$45M</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* MVP Functional Scope */}
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-slate-700" />
                MVP Functional Scope
              </CardTitle>
              <Badge variant="secondary">{mvpProgress}% Scoped</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {mvpItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 bg-white p-2 rounded-md hover:bg-slate-50 transition-colors">
                  <Checkbox 
                    id={`mvp-${item.id}`} 
                    checked={item.checked} 
                    onCheckedChange={() => toggleMvpItem(item.id)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`mvp-${item.id}`}
                      className="text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                    >
                      {item.text}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. MILESTONE ADVANCEMENT GATEWAY & FOOTER */}
      <div className="flex flex-col items-center justify-center space-y-8 mt-12 mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-2xl w-full text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Validation Complete?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Once you have gathered sufficient evidence that your solution solves a real problem that users will pay for, you can advance to building your product.
          </p>
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 transition-all bg-[#ff7a00] hover:bg-[#ff3000] mt-4 text-white font-bold"
            onClick={() => window.location.href = '/new'}
          >
            <span className="flex items-center gap-2">Go to Validation <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Button>
          {phaseState === 'product_market_fit' && (
            <p className="text-sm text-[#ffc400] mt-4 font-medium animate-in fade-in">
              State updated! You are ready to build.
            </p>
          )}
        </div>

        {/* National Resources */}
        <div className="pt-8 border-t border-slate-200 w-full flex flex-col items-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">National Resources</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://new.nsf.gov/funding/initiatives/i-corps" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              NSF I-Corps <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a href="https://americassbdc.org/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              SBDC Network <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a href="https://www.score.org/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              SCORE <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a href="https://www.sbir.gov/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              SBIR/STTR Phase I <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

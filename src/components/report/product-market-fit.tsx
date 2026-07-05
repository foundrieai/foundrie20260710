"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
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
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  Activity,
  HeartHandshake,
  DollarSign,
  LineChart,
  ArrowRight,
  ExternalLink,
  CheckSquare
} from 'lucide-react';

export function ProductMarketFit({ Context }: { Context?: any }) {
  const [phaseState, setPhaseState] = useState<'product_market_fit' | 'go_to_market_fit'>('product_market_fit');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. GOAL & CONTEXT DISPLAY */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-800 p-6 text-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-[#ffc400]" />
            <h2 className="text-xl font-bold tracking-tight">Phase 4: Product-Market Fit</h2>
          </div>
          <p className="text-slate-300 font-medium text-lg pt-2 leading-relaxed">
            Measure how well your product satisfies the market's demand. Track retention, growth, and user sentiment to validate sustained value.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Retention Curve */}
        <Card className="h-full flex flex-col md:col-span-2">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ffc400]" />
              User Retention Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-600">Month 1 Retention Target (40%)</span>
                  <span className="text-slate-900">42%</span>
                </div>
                <Progress value={100} className="h-2 bg-slate-100 [&>div]:bg-[#ff7a00]/100" />
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>M1</TableHead>
                      <TableHead>M2</TableHead>
                      <TableHead>M3</TableHead>
                      <TableHead>M4</TableHead>
                      <TableHead>M5</TableHead>
                      <TableHead>M6</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Jan 2026</TableCell>
                      <TableCell>145</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">45%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">38%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">35%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">34%</TableCell>
                      <TableCell className="bg-slate-50 text-slate-500">32%</TableCell>
                      <TableCell className="bg-slate-50 text-slate-500">30%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Feb 2026</TableCell>
                      <TableCell>210</TableCell>
                      <TableCell className="bg-[#ff7a00]/15 text-[#ffc400] font-medium">48%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">40%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">38%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">36%</TableCell>
                      <TableCell className="bg-slate-50 text-slate-500">35%</TableCell>
                      <TableCell className="text-slate-300">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mar 2026</TableCell>
                      <TableCell>340</TableCell>
                      <TableCell className="bg-[#ff7a00]/20 text-[#ffc400] font-bold">52%</TableCell>
                      <TableCell className="bg-[#ff7a00]/15 text-[#ffc400] font-medium">44%</TableCell>
                      <TableCell className="bg-[#ff7a00]/10 text-[#ffc400]">41%</TableCell>
                      <TableCell className="bg-slate-50 text-slate-500">39%</TableCell>
                      <TableCell className="text-slate-300">-</TableCell>
                      <TableCell className="text-slate-300">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction (NPS & PMF Score) */}
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-500" />
              Customer Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 bg-white p-4 border rounded-xl shadow-sm text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-tight mb-2">Net Promoter Score</p>
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-slate-900">48</span>
                </div>
                <Badge variant="outline" className="bg-[#ff7a00]/10 text-[#ffc400] border-[#ff7a00]/30">Excellent</Badge>
              </div>
              <div className="flex-1 bg-white p-4 border rounded-xl shadow-sm text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-tight mb-2">Sean Ellis Test</p>
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-slate-900">44%</span>
                </div>
                <Badge variant="outline" className="bg-[#ff7a00]/10 text-[#ffc400] border-[#ff7a00]/30">Target Reached (&gt;40%)</Badge>
                <p className="text-xs text-slate-500 mt-2">"Very disappointed if they could no longer use the product"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unit Economics */}
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Unit Economics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Customer Acquisition Cost (CAC)</span>
                <span className="block text-3xl font-bold text-slate-900 mt-2">$145</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Lifetime Value (LTV)</span>
                <span className="block text-3xl font-bold text-slate-900 mt-2">$680</span>
              </div>
              <div className="col-span-2 bg-[#ff7a00]/10 p-4 rounded-lg border border-[#ff7a00]/25 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#ffc400] uppercase tracking-tight">LTV:CAC Ratio</span>
                <span className="text-2xl font-bold text-[#ffc400]">4.7 : 1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Tracking */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="w-5 h-5 text-[#ff7a00]" />
              Key Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <p className="text-sm font-medium text-slate-600">Daily Active Users (DAU)</p>
                 <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">1,240</span>
                    <Badge variant="outline" className="bg-[#ff7a00]/10 text-[#ffc400] border-[#ff7a00]/30 border text-xs">+14% MoM</Badge>
                 </div>
               </div>
               <div className="space-y-2">
                 <p className="text-sm font-medium text-slate-600">DAU/MAU Ratio (Stickiness)</p>
                 <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">28%</span>
                    <Badge variant="outline" className="bg-[#ff7a00]/10 text-[#ffc400] border-[#ff7a00]/30 border text-xs">Good</Badge>
                 </div>
               </div>
               <div className="space-y-2">
                 <p className="text-sm font-medium text-slate-600">Time to Value (TTV)</p>
                 <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">12m</span>
                    <Badge variant="outline" className="bg-[#ff7a00]/10 text-[#ffc400] border-[#ff7a00]/30 border text-xs">-4m since launch</Badge>
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>

      </div>

      {/* 3. MILESTONE ADVANCEMENT GATEWAY & FOOTER */}
      <div className="flex flex-col items-center justify-center space-y-8 mt-12 mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-2xl w-full text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Product-Market Fit Confirmed?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Once you have proven retention, unit economics, and strong user sentiment, you are ready to pour fuel on the fire and scale your go-to-market motion.
          </p>
          <Button 
            size="lg" 
            className={`w-full sm:w-auto px-8 transition-all ${phaseState === 'go_to_market_fit' ? 'bg-[#ff7a00] hover:bg-[#ff3000]' : 'bg-slate-900 hover:bg-slate-800'}`}
            onClick={() => setPhaseState('go_to_market_fit')}
          >
            {phaseState === 'go_to_market_fit' ? (
              <span className="flex items-center gap-2"><CheckSquare className="w-5 h-5" /> Milestone Reached</span>
            ) : (
              <span className="flex items-center gap-2">Confirm Milestone: Advance to Go-to-Market Fit <ArrowRight className="w-4 h-4 ml-1" /></span>
            )}
          </Button>
          {phaseState === 'go_to_market_fit' && (
            <p className="text-sm text-[#ffc400] mt-4 font-medium animate-in fade-in">
              State updated! You are ready for Go-to-Market expansion.
            </p>
          )}
        </div>

        {/* National Resources */}
        <div className="pt-8 border-t border-slate-200 w-full flex flex-col items-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Scaling Resources</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              SBIR/STTR Phase II <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a href="#" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Growth Equity Networks <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

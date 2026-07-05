'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-idea-score.ts';
import '@/ai/flows/suggest-company-name.ts';
import '@/ai/flows/deep-dive-analysis.ts';
import '@/ai/flows/generate-startup-validation-report.ts';
import '@/ai/flows/report-chat.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/polish-report-section.ts';
import '@/ai/flows/generate-pitch-deck-content.ts';

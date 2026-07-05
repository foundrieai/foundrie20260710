
# LAUNCHCODE Recreation Guide

This document contains the exhaustive blueprint required to recreate LAUNCHCODE with 100% functional and visual fidelity in a new environment.

## Response 1: The Master Blueprint

### 1. The High-Fidelity Master Prompt
Use this prompt as the initial instruction for a new project generation. It captures the advanced logic developed for truncation handling and idea extrapolation.

```text
Build "LAUNCHCODE", an investor-grade startup validation platform.

CORE PHILOSOPHY: "The Startup Polisher"
The AI must act as a proactive venture strategist. If a user provides a sparse or underdeveloped idea, the AI's FIRST step is to extrapolate and construct the most viable, high-potential version of that concept before performing any analysis.

TAGLINE: "The Right Way to Start Up & Scale Your Innovations."

TECHNICAL ARCHITECTURE:
- Stack: Next.js 15 (App Router), Genkit 1.x, Firebase (Auth & Firestore), ShadCN UI, Tailwind CSS.
- Truncation Handling (CRITICAL):
    1. System Prompt Priority: Operational instructions (like completion markers) must be in the `system` property of Genkit flows.
    2. Completion Marker: Use `[ANALYSIS_COMPLETE]` (case-insensitive).
    3. Recursive Stitching Logic: The UI (ReportClientShell) must detect the absence of the marker and automatically trigger up to 3 recursive continuation calls using a dedicated `continueReportSection` flow. It then stitches the results together seamlessly.
    4. Token Budget: Set `maxOutputTokens` to 8,192 for all report generation calls.

FUNCTIONAL SPECIFICATIONS:
- 14-Section Framework: Purpose, Problem, Solution, Why Now, Market Size, Competition, Roadmap, Business Model, Traction, Team, Financials, Risks, Action Plan, Sources.
- Weighted Scoring: 0-10 scores for Market Potential (30%), Competitive Edge (25%), Technical Feasibility (20%), and Financial Viability (25%).
- Executive Summary: One-click generation available only after all 14 sections are complete.
- Persistent AI Chat: Firebase-backed sidebar chat that can trigger report revisions and section regenerations. Includes real-time research tools.
- Deep Dive Research: One-click granular analysis for any section using a dedicated side-sheet.
- Exporting: Markdown, PDF (Print CSS), and professional Word (.doc) formats.

VISUAL IDENTITY ("Liquid Glass"):
- Base Background: hsl(240 14% 6%) - Deep obsidian.
- Primary Accent: hsl(221 91% 60%) - Electric Blue.
- Components: Use backdrop-blur-xl (12px-24px), semi-transparent gradients, and 1px primary-glow borders for all Card components.
- Navigation: Left-aligned sticky sidebar Table of Contents with Scroll-Spy intersection observer.
```

### 2. Post-Deployment Configuration (CRITICAL)
After generating the project, you MUST perform these steps in the Firebase Console:
1. **Enable Auth Providers**: Go to Authentication > Sign-in method and enable **Email/Password** and **Google**.
2. **Provision Firestore**: Create a Firestore database in your project region.
3. **Security Rules**: Deploy the rules found in `firestore.rules`.

### 3. Verified `backend.json` Structure
This defines the precise Firestore structure and data types.

```json
{
  "entities": {
    "User": {
      "title": "User",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "displayName": { "type": "string" },
        "photoURL": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "subscription": { "type": "string", "enum": ["free", "pro", "enterprise"] },
        "reportsGenerated": { "type": "number" },
        "reportsRemaining": { "type": "number" }
      },
      "required": ["id", "email", "createdAt", "subscription"]
    },
    "Report": {
      "title": "Report",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "userId": { "type": "string" },
        "companyName": { "type": "string" },
        "description": { "type": "string" },
        "industry": { "type": "string" },
        "tagline": { "type": "string" },
        "executiveSummary": { "type": "string" },
        "status": { "type": "string", "enum": ["draft", "generating", "complete", "error"] },
        "content": { "type": "object" },
        "scores": { "type": "object" }
      },
      "required": ["id", "userId", "companyName", "status"]
    }
  },
  "auth": { "providers": ["password", "google.com"] },
  "firestore": {
    "/users/{userId}": { "schema": { "$ref": "#/backend/entities/User" } },
    "/users/{userId}/reports/{reportId}": { "schema": { "$ref": "#/backend/entities/Report" } },
    "/users/{userId}/reports/{reportId}/messages/{messageId}": { "schema": { "type": "object" } }
  }
}
```

# **App Name**: LaunchCode AI

## Core Features:

- Startup Idea Input: Collect user inputs for company name, description, industry, target market, and stage via a web form.
- AI-Powered Report Generation: Generate a 14-section startup validation report based on Sequoia Capital's framework, using user inputs and data from the Gemini Pro AI tool and the Serper API, formatted as markdown. Scores will be calculated and included at the end.
- Deep Dive Analysis: Provide deeper analysis with AI and generate additional markdown output based on the chosen section using the AI tool.
- Report Display and Navigation: Display the generated report in a user-friendly three-column layout with sticky navigation and scroll-spy highlighting.
- Scoring Table Display: Display the scoring table with detailed rationales at the end of the report.
- Export Functionality: Enable users to export the generated report in both PDF and Markdown formats.
- Shareable Links: Create shareable links for the generated reports.
- User Authentication: Provide user authentication through Firebase Auth (Email/Password + Google).
- Firestore Integration: Store the input data in the Firebase database.

## Style Guidelines:

- Primary color: Accent Blue (#3B82F6) for highlights and active elements.
- Background color: Near-black base (#0A0A0F) to create a dark mode 'Liquid Glass' effect.
- Accent color: Accent Blue Light (#60A5FA) for hover states.
- Display/Headings font: 'Plus Jakarta Sans' (sans-serif) for a modern, geometric feel.
- Body text font: 'DM Sans' (sans-serif) for clean, readable, professional text.
- Monospace/Data font: 'JetBrains Mono' for scores, numbers, and code.
- Use minimalist icons from Lucide React.
- Employ a three-column layout for report viewing, including sticky navigation.
- Apply staggered fade-in animations for report sections, creating a smooth loading experience.
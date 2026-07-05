import { FullPhaseData } from '@/lib/phases/types';

export const pmfPhaseData: FullPhaseData = {
  id: 'pmf',
  journeyPosition: 2,
  journeyTotal: 5,
  name: 'Product-Market Fit',
  accentColor: '#FF3000',
  tagline: 'This is the most misunderstood and most dangerous stage of the journey. Your only task here is to determine whether your product solves a problem deeply enough that customers use it voluntarily, return to it repeatedly, and would be genuinely upset if it disappeared. This phase is about fit, not growth.',
  subPhases: ['2A - PMF Discovery', '2B - PMF Confirmation'],
  subPhasesData: [
    {
      id: 'pmf-a',
      label: '2A - PMF Discovery',
      activities: [
        {
          id: 'mvpDevelopment',
          title: 'MVP Development',
          subtitle: 'one user · one use case · one workflow',
          learnMore: 'Build the simplest version that delivers the core value. Focus on one core user, one core use case, and one primary workflow, and resist every non-essential feature. The discipline of a true minimum viable product is not about being small for its own sake - it is about being surgically focused on the single value the product promises. Every feature you add before that core value is proven dilutes your ability to learn whether the core value is real.',
          evidenceFields: [
            { id: 'coreUser', label: 'one core user type', type: 'text', placeholder: 'who is the single user you build for?' },
            { id: 'coreUseCase', label: 'one core use case', type: 'text', placeholder: 'the single job to be done' },
            { id: 'coreWorkflow', label: 'primary workflow', type: 'text', placeholder: 'step one → step two → value' },
            { id: 'timeToValue', label: 'time to first value', type: 'number', placeholder: '0', unit: 'min' }
          ],
          ideamaitOpening: 'Tell me the one action a user takes that delivers the core value of your product. Not a feature list - the single moment where they receive the thing they came for. That moment is what your minimum viable product must reach as fast as possible.',
          secondaryAction: {
            label: 'MVP focus framework ↗',
            promptText: 'Help me define a minimum viable product focused on one core user, one core use case, and one primary workflow, and identify which features to resist building until core value is proven.'
          }
        },
        {
          id: 'activationOptimization',
          title: 'Onboarding & Activation Optimization',
          subtitle: 'realized-value moment · early milestones · contextual prompts',
          learnMore: 'Activation is the first time a user receives the value the product promises. Design a guided first experience with a clear moment of realized value, early milestones, and contextual prompts that carry the user to that moment quickly. Most products lose users not because the value is absent but because the path to it is unclear. The work here is to remove every step between signup and the moment the user thinks "I understand why this matters."',
          evidenceFields: [
            { id: 'ahaMoment', label: 'the realized-value moment', type: 'text', placeholder: 'the aha moment in your product' },
            { id: 'activationRate', label: 'activation rate', type: 'number', placeholder: '0', unit: '%' },
            { id: 'onboardingSteps', label: 'steps to first value', type: 'number', placeholder: '0' }
          ],
          ideamaitOpening: 'What is the moment a new user first realizes the value of your product, and how many steps stand between signing up and reaching it? We are going to find every step we can remove.',
          secondaryAction: {
            label: 'Activation funnel guide ↗',
            promptText: 'Walk me through designing an onboarding and activation funnel with a clear realized-value moment, early milestones, and contextual prompts, for a product in PMF Discovery.'
          }
        },
        {
          id: 'feedbackLoops',
          title: 'Customer Feedback Loops',
          subtitle: 'calls · in-app surveys · session recording · founder interviews',
          learnMore: 'Gather continuous feedback through customer calls, in-app surveys, session-recording tools, and founder-led interviews. Feedback is not a one-time exercise at this stage - it is a rhythm. The founders who reach product-market fit fastest are the ones who never stop talking to users, even as the number of users grows. The insights that change product direction rarely come from a dashboard; they come from watching a real person struggle with the thing you built.',
          evidenceFields: [
            { id: 'interviewsThisWeek', label: 'founder interviews this week', type: 'number', placeholder: '0' },
            { id: 'feedbackChannels', label: 'feedback channels active', type: 'text', placeholder: 'calls / surveys / session recording' },
            { id: 'topInsight', label: 'top insight this week', type: 'textarea', placeholder: 'what did you hear that changed how you think about the product?' }
          ],
          ideamaitOpening: 'Tell me about the most recent time you watched a real user interact with your product. What did they struggle with that you did not expect? That struggle is worth more than any survey result.',
          secondaryAction: {
            label: 'Feedback system setup ↗',
            promptText: 'Help me build a continuous customer feedback system using customer calls, in-app surveys, session-recording tools, and founder-led interviews, for a product in PMF Discovery.'
          }
        },
        {
          id: 'retentionTracking',
          title: 'Usage & Retention Tracking',
          subtitle: 'DAU · WAU · monthly retention · power-user behavior',
          learnMore: 'Define and monitor daily and weekly active users, monthly retention, and the power-user behaviors that predict long-term retention. Retention is the only metric that proves product-market fit - it answers whether users come back on their own, without being pushed. Define your metrics before you look at the numbers, because otherwise you will unconsciously optimize toward whichever metric happens to look best rather than the one that matters.',
          evidenceFields: [
            { id: 'dauMau', label: 'DAU / MAU ratio', type: 'number', placeholder: '0', unit: '%' },
            { id: 'monthlyRetention', label: 'monthly retention', type: 'number', placeholder: '0', unit: '%' },
            { id: 'powerUserBehavior', label: 'power-user behavior that predicts retention', type: 'text', placeholder: 'what do your best users do?' }
          ],
          ideamaitOpening: 'What is your ratio of daily to monthly active users right now? If it is below twenty percent, do not be discouraged - but that number is the truth about whether users come back on their own, and it is where our attention belongs.',
          secondaryAction: {
            label: 'Retention analytics guide ↗',
            promptText: 'What analytics should a product in PMF Discovery track, and how do I measure daily and weekly active users, monthly retention, and the power-user behaviors that predict long-term retention?'
          }
        },
        {
          id: 'iterationCycles',
          title: 'Iteration Cycles',
          subtitle: 'ship → measure → learn → improve, weekly',
          learnMore: 'Run rapid weekly cycles of shipping, measuring, learning, and improving. Each cycle answers four questions: what did you ship, what did users do, where did they struggle, and what will you improve next. The speed of this loop is the single best predictor of how fast you reach product-market fit. A team that completes a full learning cycle every week will outpace a team that ships monthly, even if the monthly team writes better code.',
          evidenceFields: [
            { id: 'cycleLength', label: 'iteration cycle length', type: 'number', placeholder: '0', unit: 'days' },
            { id: 'shippedThisCycle', label: 'what you shipped this cycle', type: 'text', placeholder: 'the change you released' },
            { id: 'learnedThisCycle', label: 'what you learned', type: 'textarea', placeholder: 'what users did, where they struggled, what you will improve next' }
          ],
          ideamaitOpening: 'Walk me through your last iteration cycle: what you shipped, what users did with it, where they struggled, and what you decided to improve next. If you cannot answer all four, that is the discipline we need to build.',
          secondaryAction: {
            label: 'Iteration loop template ↗',
            promptText: 'Give me a weekly iteration cycle template for PMF Discovery that answers what we shipped, what users did, where they struggled, and what we will improve next.'
          }
        }
      ],
      deliverables: [
        { id: 'workingMvp', title: 'A working MVP', description: 'The simplest version that delivers the core value to one user, one use case, one workflow.' },
        { id: 'activationFunnel', title: 'A clear activation funnel', description: 'A defined path from signup to the realized-value moment, with the activation rate measured.' },
        { id: 'analyticsDashboard', title: 'Three to five core usage metrics on a dashboard', description: 'A regular analytics dashboard showing the small set of metrics that actually predict retention.' },
        { id: 'rankedBacklog', title: 'A feature backlog ranked by retention impact', description: 'A backlog ordered not by what is loudest but by what most improves whether users return.' },
        { id: 'mustHaveVsNice', title: 'Must-have versus nice-to-have features documented', description: 'A clear, written distinction that protects the core value from feature creep.' }
      ],
      exitMilestones: [
        { id: 'retentionFlattens', label: 'Retention curve', target: 'Flattens, does not fall to zero' },
        { id: 'dauMauThreshold', label: 'DAU / MAU', target: 'Exceeds 20%' },
        { id: 'veryDisappointed', label: 'Very disappointed', target: '30-40% of active users' },
        { id: 'npsThreshold', label: 'Net Promoter Score', target: 'Exceeds 30' },
        { id: 'organicDemand', label: 'Organic usage', target: 'Users request features, increase usage' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Mistaking feature adoption for product love. A user clicking a feature once is not validation; the signal is whether they return and repeat.' },
        { severity: 'warning', text: 'Tracking vanity metrics such as signups rather than retention, and building for the wrong segment. Measure what happens after activation, not before.' },
        { severity: 'watch', text: 'Adding features instead of deepening core value, and scaling marketing, hiring, or infrastructure before fit is real. Premature scaling compounds the problem rather than the solution.' }
      ],
      funding: [
        { label: 'Seed round - angel syndicates, seed-focused venture funds, accelerators, and state innovation grants. Use capital for MVP refinement, customer research, analytics infrastructure, and first hires. Increasingly priced rather than a SAFE; expect roughly fifteen to twenty-five percent dilution.', amount: '$500K-$2.5M' }
      ],
      teamShape: [
        'Product-oriented founder',
        '1-3 engineers',
        'customer success or support',
        'generalist marketer',
        'fractional advisors',
        'avoid over-hiring'
      ]
    },
    {
      id: 'pmf-b',
      label: '2B - PMF Confirmation',
      activities: [
        {
          id: 'coreValueLoop',
          title: 'Refine the Core Value Loop',
          subtitle: 'activation → value → habit → referral or expansion',
          learnMore: 'Find the shortest path between activation, realized value, habit formation, and referral or expansion. The core value loop is the engine of a product that compounds: a user activates, receives value, forms a habit, and then either expands their own usage or brings in someone new. Your job is to identify that loop and then shorten every step of it. A product with a tight value loop grows on its own; a product without one has to be pushed forever.',
          evidenceFields: [
            { id: 'valueLoopSteps', label: 'the loop in plain steps', type: 'textarea', placeholder: 'activation → value → habit → referral or expansion' },
            { id: 'shortestPath', label: 'shortest path to repeat value', type: 'text', placeholder: 'how fast can a user get value again?' },
            { id: 'habitTrigger', label: 'what forms the habit', type: 'text', placeholder: 'the trigger that brings them back' }
          ],
          ideamaitOpening: 'Describe the loop that brings a user back to your product on their own - from the first value they receive to the moment they return for more. Where in that loop is the longest delay? That delay is what we shorten.',
          secondaryAction: {
            label: 'Value loop framework ↗',
            promptText: 'Help me map and shorten my core value loop - activation, realized value, habit formation, and referral or expansion - for a product in PMF Confirmation.'
          }
        },
        {
          id: 'retentionDrivers',
          title: 'Improve Retention Drivers',
          subtitle: 'cohort analysis · drop-off mapping · strongest segments',
          learnMore: 'Use cohort analysis to learn which actions predict long-term use, where users drop off, and which segments are strongest. Cohort analysis is the difference between knowing your retention number and understanding it. When you can see that users who take a specific action in week one retain at twice the rate of those who do not, you know exactly what your onboarding should drive toward. Find that action. Build everything around it.',
          evidenceFields: [
            { id: 'predictiveAction', label: 'action that predicts retention', type: 'text', placeholder: 'what early action correlates with staying?' },
            { id: 'biggestDropoff', label: 'where users drop off', type: 'text', placeholder: 'the stage with the steepest fall' },
            { id: 'strongestSegment', label: 'strongest segment', type: 'text', placeholder: 'which cohort retains best?' }
          ],
          ideamaitOpening: 'Run your cohorts and tell me: what single action, taken early, most separates the users who stay from the users who leave? If you do not know yet, finding that action is the most valuable work you can do this week.',
          secondaryAction: {
            label: 'Cohort analysis guide ↗',
            promptText: 'Walk me through cohort analysis for PMF Confirmation: how to find the actions that predict long-term retention, map where users drop off, and identify the strongest segments.'
          }
        },
        {
          id: 'basicRevenue',
          title: 'Introduce Basic Revenue',
          subtitle: 'who pays · how much · how often · conversion rate',
          learnMore: 'Confirm who pays, how much, how often, and at what rate activated users convert to paying customers. Revenue at this stage is not about maximizing income - it is about proving that the value you deliver is worth money to the people who receive it. A user who pays, even a small amount, has told you something a free user never can. Introduce pricing carefully and watch the activation-to-payment conversion rate closely; it is one of the truest measures of real value.',
          evidenceFields: [
            { id: 'whoPays', label: 'who pays', type: 'text', placeholder: 'which user or buyer pays?' },
            { id: 'priceAndFrequency', label: 'how much and how often', type: 'text', placeholder: 'e.g. $40/month' },
            { id: 'conversionRate', label: 'activation-to-payment rate', type: 'number', placeholder: '0', unit: '%' },
            { id: 'currentMrr', label: 'current MRR', type: 'number', placeholder: '0', unit: '$' }
          ],
          ideamaitOpening: 'Tell me who pays you today, how much, and how often. Then tell me what share of activated users convert to paying. That conversion rate is one of the truest signals of whether your value is real.',
          secondaryAction: {
            label: 'Pricing test framework ↗',
            promptText: 'Help me introduce basic revenue in PMF Confirmation: confirm who pays, how much, how often, and the activation-to-payment conversion rate, and test freemium, trial, and hybrid pricing.'
          }
        },
        {
          id: 'eliminateFriction',
          title: 'Eliminate Friction',
          subtitle: 'setup · onboarding · first value · payment · support',
          learnMore: 'Remove anything that slows setup, onboarding, first value, payment, or support. Friction is the silent killer of products that otherwise have fit. Every extra step, every confusing screen, every delay between intent and outcome costs you users who would have stayed. Walk your own product as a new user would and mark every place you have to think, wait, or guess. Each one of those is a place a real user leaves.',
          evidenceFields: [
            { id: 'frictionRemoved', label: 'biggest friction you removed', type: 'text', placeholder: 'what slowed users that you fixed?' },
            { id: 'frictionRemaining', label: 'biggest friction remaining', type: 'textarea', placeholder: 'where do users still have to think, wait, or guess?' }
          ],
          ideamaitOpening: 'Walk through your own product as a brand-new user right now. Tell me the first place you have to stop and think, wait, or guess. That is the friction a real user does not push through - and it is the first thing we remove.',
          secondaryAction: {
            label: 'Friction audit guide ↗',
            promptText: 'Give me a friction audit framework for PMF Confirmation covering setup, onboarding, first value, payment, and support, so I can find and remove what slows users.'
          }
        },
        {
          id: 'customerSuccess',
          title: 'Establish a Customer-Success Function',
          subtitle: 'proactive onboarding · early value · structured feedback',
          learnMore: 'Provide proactive onboarding, early value delivery, and structured feedback loops. Customer success at this stage is not a department - it is a motion. It is the deliberate practice of making sure new customers reach value quickly and that their feedback flows back into the product. The companies that confirm product-market fit are the ones who treat each early customer as a relationship to be deepened, not a transaction to be completed.',
          evidenceFields: [
            { id: 'championUsers', label: 'enthusiastic champion users', type: 'number', placeholder: '0' },
            { id: 'successMotion', label: 'your customer-success motion', type: 'text', placeholder: 'how do you deliver early value proactively?' },
            { id: 'buyerPersona', label: 'clear buyer persona', type: 'textarea', placeholder: 'who is the buyer, and what do they value most?' }
          ],
          ideamaitOpening: 'How many customers right now are genuinely enthusiastic - the kind who would recommend you unprompted? Name them if you can. Those champions are the foundation of your customer-success motion, and we want more of them.',
          secondaryAction: {
            label: 'Customer success playbook ↗',
            promptText: 'Help me establish a customer-success motion for PMF Confirmation with proactive onboarding, early value delivery, and structured feedback loops, and define a clear buyer persona.'
          }
        }
      ],
      deliverables: [
        { id: 'revenueModel', title: 'A validated revenue model with refined pricing', description: 'Proof of who pays, how much, and how often, with pricing refined against real conversion data.' },
        { id: 'flatteningRetention', title: 'A strong, flattening retention curve', description: 'A retention curve that settles at a sustainable baseline rather than falling to zero.' },
        { id: 'buyerPersonaDoc', title: 'A clear buyer persona', description: 'A documented persona describing who buys, why, and what they value most.' },
        { id: 'successMotionDoc', title: 'An established customer-success motion', description: 'A repeatable motion for getting new customers to value and channeling their feedback back into the product.' },
        { id: 'championUsersDoc', title: 'Ten or more enthusiastic champion users', description: 'A documented set of champions who use the product voluntarily and would recommend it unprompted.', linkedTool: 'founderOs', linkedToolLabel: 'Track your champions and core metrics over time in Founder OS. Open Founder OS ↗' }
      ],
      exitMilestones: [
        { id: 'inboundDemand', label: 'Inbound demand', target: 'Customers reach out; demand exceeds supply' },
        { id: 'retentionBaseline', label: 'Retention baseline', target: 'Settles at a sustainable level' },
        { id: 'mrrRange', label: 'MRR or paying customers', target: '$10K-$100K MRR or 20+ B2B customers' },
        { id: 'cacPredictable', label: 'CAC', target: 'Predictable at small scale' },
        { id: 'ltvCacTrend', label: 'LTV : CAC', target: 'Trends toward 3:1' },
        { id: 'engineeringStable', label: 'Engineering', target: 'Stable enough to scale' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Calling product-market fit confirmed on revenue alone. Revenue without strong retention is a leaky bucket, not fit.' },
        { severity: 'warning', text: 'Expanding the team too fast and losing touch with individual users. The team shape in Confirmation should look much like Discovery; keep doing user calls as you grow.' },
        { severity: 'watch', text: 'Moving to growth tactics before retention is proven. Paid acquisition into a product without fit burns money and hides the real problem.' }
      ],
      funding: [
        { label: 'Seed round continues - learn the mechanics that govern your ownership now: pre-money versus post-money valuation, the option-pool shuffle, pro-rata rights, and standard preferred terms, where a one-times non-participating liquidation preference is the founder-friendly norm. Adopt an equity incentive plan supported by a 409A valuation.', amount: 'Priced round, 15-25% dilution' }
      ],
      teamShape: [
        'Product-oriented founder',
        '1-3 engineers',
        'customer success',
        'generalist marketer',
        'fractional advisors',
        'stay scrappy and user-obsessed'
      ]
    }
  ]
};

import type { FullPhaseData } from './types';

export const psfPhaseData: FullPhaseData = {
  id: 'psf',
  journeyPosition: 1,
  journeyTotal: 5,
  name: 'Problem-Solution Fit',
  accentColor: '#FF3000',
  tagline: 'Validation tests whether your proposed solution actually addresses the pain you uncovered. This phase is not about the product. It is about confirming that the solution concept aligns with a real, urgent, and valuable problem for a specific segment.',
  subPhases: ['1A - Problem & Discovery', '1B - Solution & Willingness to Pay'],
  subPhasesData: [
    {
      id: 'psf-a',
      label: '1A - Problem & Discovery',
      activities: [
        {
          id: 'customerDiscovery',
          subtitle: '20-50 interviews · behavior, not opinion',
          learnMore: 'Go far deeper than your ideation conversations. The purpose here is to study behavior, not to collect opinions. Understand the alternatives and workarounds customers use today, identify where budget already flows, and discover the triggers that create urgency. Opinions are cheap and customers give them freely to be polite. Behavior is expensive and honest - what someone already does, already pays for, and already works around tells you the truth their words will not.',
          evidenceFields: [
            { id: 'interviewsTotal', label: 'total interviews completed', type: 'number', placeholder: '0' },
            { id: 'interviewsThisWeek', label: 'interviews this week', type: 'number', placeholder: '0' },
            { id: 'currentWorkaround', label: 'current workaround customers use', type: 'text', placeholder: 'what do they do today instead?' },
            { id: 'budgetSource', label: 'where budget already flows', type: 'text', placeholder: 'what do they already pay for here?' },
            { id: 'urgencyTrigger', label: 'the trigger that creates urgency', type: 'textarea', placeholder: 'what event makes this problem suddenly need solving?' }
          ],
          ideamaitOpening: 'Let us make sure these interviews study behavior, not opinion. Tell me about the last conversation you had - did you ask what they think, or did you learn what they already do and pay for today?',
          secondaryAction: {
            label: 'Discovery interview script ↗',
            promptText: 'Generate a structured customer discovery interview script focused on behavior rather than opinion, designed to uncover current workarounds, where budget already flows, and the triggers that create urgency. The script should avoid pitching any solution.'
          }
        },
        {
          id: 'hypothesisPrioritization',
          subtitle: 'rank by fatality · test the riskiest belief first',
          learnMore: 'You are holding a set of assumptions, and some of them, if wrong, will kill the company. Your job is to identify which assumptions are most likely to be fatal and rank them, often with a simple risk matrix, so that you test the riskiest beliefs first. Founders waste months validating the assumptions they are most comfortable with. Discipline means deliberately attacking the belief you most want to be true, because that is the one whose failure costs you the most to discover late.',
          evidenceFields: [
            { id: 'riskiestAssumption', label: 'your riskiest assumption', type: 'textarea', placeholder: 'the belief that, if wrong, is most fatal' },
            { id: 'assumptionsRanked', label: 'assumptions ranked', type: 'number', placeholder: '0' },
            { id: 'testPlanned', label: 'how you will test the riskiest one', type: 'text', placeholder: 'what experiment tests it?' }
          ],
          ideamaitOpening: 'Name the one assumption behind your business that, if it turned out to be false, would end the company. Do not give me the safe one - give me the one you are most afraid to test.',
          secondaryAction: {
            label: 'Risk matrix template ↗',
            promptText: 'Give me a simple assumption risk matrix for prioritizing startup hypotheses by likelihood of being fatal, so I can test the riskiest beliefs first in the Problem-Solution Fit phase.'
          }
        },
        {
          id: 'icpRefinement',
          subtitle: 'one segment · describable in a single sentence',
          learnMore: 'A precise ideal customer profile is the foundation of everything that follows - your messaging, your prototype, your pricing, your sales motion. The test of a real ICP is that you can describe it in a single sentence that names not just who the customer is but the specific situation, trigger, and budget authority that makes them feel the problem most acutely. A demographic is not an ICP. Specificity is a competitive advantage; you can always widen later, but you cannot recover the time lost building for everyone at once.',
          evidenceFields: [
            { id: 'icpSentence', label: 'ICP in a single sentence', type: 'textarea', placeholder: 'describe your ideal customer in one precise sentence' },
            { id: 'icpTrigger', label: 'what triggers the problem for them', type: 'text', placeholder: 'the moment the problem becomes urgent' },
            { id: 'budgetAuthority', label: 'who holds budget authority', type: 'text', placeholder: 'who controls the money to solve this?' }
          ],
          ideamaitOpening: 'Describe your ideal customer to me in a single sentence - not their demographics, but their situation, the trigger that makes the problem urgent, and whether they control the budget to solve it. If it takes more than one sentence, we will sharpen it together.',
          secondaryAction: {
            label: 'Refine ICP with BrandAgent ↗',
            promptText: 'Open BrandAgent to help me articulate my ideal customer profile within my broader brand positioning, describing the specific situation, trigger, and budget authority of my target customer.'
          }
        }
      ],
      deliverables: [
        { id: 'preciseIcp', title: 'A precise ideal customer profile', description: 'An ICP you can describe in a single sentence, naming the situation, trigger, and budget authority - not a demographic.', linkedTool: 'brandAgent', linkedToolLabel: 'BrandAgent can help you articulate your ICP within your brand positioning. Open BrandAgent ↗' },
        { id: 'rankedAssumptions', title: 'A ranked list of validated and invalidated assumptions', description: 'Your assumptions ordered by risk, each marked validated or invalidated against the evidence you gathered.' },
        { id: 'discoverySynthesis', title: 'A customer-discovery synthesis', description: 'A synthesis of your interviews with representative quotes and the patterns that recur across conversations.' },
        { id: 'competitiveLandscape', title: 'A competitive landscape assessment', description: 'A map of the current alternatives and workarounds customers use, and where your approach differs.' }
      ],
      exitMilestones: [
        { id: 'feelsPain', label: 'Pain confirmed', target: 'Customers strongly agree they feel it' },
        { id: 'icpOneSentence', label: 'ICP defined', target: 'Describable in a single sentence' },
        { id: 'riskyTested', label: 'Riskiest assumptions tested', target: 'Ranked and attacked first' },
        { id: 'interviewsDepth', label: 'Discovery depth', target: '20-50 behavior-focused interviews' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Pitching the solution too early. The moment you describe your product, you contaminate the data - every answer after that is shaped by what they think you want to hear.' },
        { severity: 'warning', text: 'Interviewing the wrong people, or validating with friends and colleagues rather than real customers. People who care about you will not tell you the truth.' },
        { severity: 'watch', text: 'Relying on surveys instead of conversations. Surveys capture opinion; conversations reveal behavior, and only behavior validates.' }
      ],
      funding: [
        {
          label: 'Pre-seed - angels, accelerators, friends and family, state innovation grants, or university entrepreneurship centers. Use capital to validate demand and build a prototype, not to build a finished product. Usually structured as SAFEs or convertible notes.',
          amount: '$100K-$500K'
        }
      ],
      teamShape: ['Founder driving discovery · technical partner or contractor for prototypes · optional advisor or mentor · contract specialists as needed']
    },
    {
      id: 'psf-b',
      label: '1B - Solution & Willingness to Pay',
      activities: [
        {
          id: 'prototypeDevelopment',
          subtitle: 'test reactions, not usability · rapid tools',
          learnMore: 'You do not need to build the product. You need something tangible enough to provoke an honest reaction - a prototype built with rapid tools, a mockup video, a process diagram, or a concierge approach where you deliver the outcome manually behind the scenes. The goal at this stage is to test reactions to the concept, not the usability of a finished interface. If your prototype takes weeks to build, you have misunderstood its purpose. It exists to learn, and learning should be cheap and fast.',
          evidenceFields: [
            { id: 'prototypeFormat', label: 'prototype format', type: 'text', placeholder: 'mockup / video / diagram / concierge' },
            { id: 'shownToCount', label: 'customers shown it', type: 'number', placeholder: '0' },
            { id: 'commonReaction', label: 'most common reaction', type: 'text', placeholder: 'what did they say or do first?' },
            { id: 'biggestObjection', label: 'biggest confusion or objection', type: 'textarea', placeholder: 'what did they not understand or push back on?' }
          ],
          ideamaitOpening: 'Describe your prototype to me as if I cannot see it. What form does it take, and how long did it take to build? If the answer is more than a few days, we should talk about why - at this stage it exists to provoke reactions, not to be polished.',
          secondaryAction: {
            label: 'Lo-fi prototyping approaches ↗',
            promptText: 'Walk me through low- and mid-fidelity prototyping approaches for the Problem-Solution Fit phase - rapid mockup tools, mockup videos, process diagrams, and concierge methods - chosen to test reactions to the concept rather than usability.'
          }
        },
        {
          id: 'messagingValidation',
          subtitle: 'value prop · positioning · fake-door & A/B',
          learnMore: 'Before you build, test whether the market responds to how you describe the solution. Validate your value proposition, positioning, target segment, and willingness to pay through waitlist pages, fake-door tests, and simple A/B experiments. A landing page that converts strangers into waitlist signups tells you more than a dozen friendly conversations. The discipline is to test the message against people who do not know you and have no reason to be kind.',
          evidenceFields: [
            { id: 'landingConversion', label: 'landing page conversion', type: 'number', placeholder: '0', unit: '%' },
            { id: 'valuePropTested', label: 'value proposition tested', type: 'text', placeholder: 'the headline you tested' },
            { id: 'variantsRun', label: 'message variants tested', type: 'number', placeholder: '0' }
          ],
          ideamaitOpening: 'Tell me the headline on your landing page exactly as it reads now. Then tell me your conversion rate from visitor to signup. We will judge whether the message is landing with strangers, not just with people who already like you.',
          secondaryAction: {
            label: 'Fake-door test guide ↗',
            promptText: 'Explain how to run landing page, fake-door, and simple A/B tests to validate a value proposition, positioning, target segment, and willingness to pay in the Problem-Solution Fit phase.'
          }
        },
        {
          id: 'willingnessToPay',
          subtitle: 'behavioral signals · LOIs · deposits · paid pilots',
          learnMore: 'This is the activity that separates real validation from comfortable delusion. Polite interest is not buying intent. Require behavioral signals: signed letters of intent, deposits, pre-orders, or commitments to paid pilots. A customer who will not put their name, their money, or their calendar behind the problem has not actually validated it, however enthusiastic they sound. The cost of skipping this step is building a product nobody pays for - which is the most expensive mistake an early company can make.',
          evidenceFields: [
            { id: 'buyingIntentCount', label: 'customers with genuine buying intent', type: 'number', placeholder: '0' },
            { id: 'behavioralSignals', label: 'behavioral signals collected', type: 'text', placeholder: 'LOIs / deposits / pre-orders / pilots' },
            { id: 'pilotPipeline', label: 'pilot users in pipeline', type: 'number', placeholder: '0' }
          ],
          ideamaitOpening: 'Tell me how many customers have done something costly to signal they will buy - signed a letter of intent, put down a deposit, committed to a paid pilot. Not how many said it sounds interesting. How many acted.',
          secondaryAction: {
            label: 'LOI and pilot templates ↗',
            promptText: 'Give me templates and a framework for collecting behavioral willingness-to-pay signals - letters of intent, deposits, pre-orders, and paid pilot commitments - during the Problem-Solution Fit phase.'
          }
        },
        {
          id: 'mvpScoping',
          subtitle: 'smallest feature set · the core path only',
          learnMore: 'Define the minimum viable product without building it. Identify the smallest feature set that delivers the core value, and map the single path a user must travel to experience it. The discipline here is subtraction - every feature you can defer is time and money you keep for learning. The scope you define now becomes the brief for the next phase, so be ruthless. A bloated MVP scope is a Product-Market Fit phase that takes twice as long and teaches half as much.',
          evidenceFields: [
            { id: 'coreFeatures', label: 'core features in MVP scope', type: 'number', placeholder: '0' },
            { id: 'corePath', label: 'the core path a user travels', type: 'textarea', placeholder: 'step one → step two → value' },
            { id: 'deferredFeatures', label: 'features deliberately deferred', type: 'text', placeholder: 'what you are choosing not to build yet' }
          ],
          ideamaitOpening: 'Map the single path a user must travel to receive the core value, in plain steps. Then tell me everything you are tempted to build that is not on that path - because that is exactly what we cut from the MVP scope.',
          secondaryAction: {
            label: 'MVP scoping framework ↗',
            promptText: 'Help me scope a minimum viable product without building it: identify the smallest feature set that delivers core value, map the core user path, and decide what to defer, for the Problem-Solution Fit phase.'
          }
        }
      ],
      deliverables: [
        { id: 'valueProposition', title: 'An updated value proposition', description: 'A refined value proposition validated through landing page and messaging tests against real strangers.' },
        { id: 'prototype', title: 'A low- or mid-fidelity prototype', description: 'Something tangible that provokes an honest reaction to the concept - not a finished interface.' },
        { id: 'problemSolutionNarrative', title: 'A clear problem-solution narrative', description: 'A written narrative tying the validated problem to your solution concept, with the evidence behind each link.' },
        { id: 'mvpSpec', title: 'An MVP specification', description: 'A specification or set of functional requirements defining the smallest buildable product and its core path.', linkedTool: 'validationReport', linkedToolLabel: 'Review Section IV of your validation report and align your MVP scope to it. Open report ↗' },
        { id: 'loiData', title: 'Letters of intent, pre-orders, or waitlist data', description: 'Documented behavioral signals proving customers will pay, not merely that they approve.' }
      ],
      exitMilestones: [
        { id: 'buyingIntent', label: 'Buying intent', target: '10+ customers express genuine intent' },
        { id: 'solutionImproves', label: 'Solution validated', target: 'Would meaningfully improve outcomes' },
        { id: 'pilotPipeline', label: 'Pilot pipeline', target: 'A small pipeline of pilot users' },
        { id: 'behavioralProof', label: 'Behavioral proof', target: 'LOIs, deposits, or pre-orders collected' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Building before validating core assumptions. Writing code before customers have signaled they will pay is the most expensive mistake at this stage.' },
        { severity: 'warning', text: 'Mistaking polite interest for buying intent, and confusing compliments with traction. Only behavioral signals count.' },
        { severity: 'watch', text: 'Validating with the same small group repeatedly. Fresh strangers, not familiar supporters, are what test a concept honestly.' }
      ],
      funding: [
        {
          label: 'Pre-seed continues - track ownership on an as-converted basis rather than by dollars raised, and reserve an option pool, commonly ten to fifteen percent, for your first hires. Put IP assignment agreements in place with every contractor.',
          amount: 'SAFE / convertible note'
        }
      ],
      teamShape: ['Two to four people · founder on discovery · technical partner on prototypes · IP assignment with every contractor']
    }
  ]
};

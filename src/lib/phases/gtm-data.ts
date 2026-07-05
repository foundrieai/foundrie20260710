import { FullPhaseData } from '@/lib/phases/types';

export const gtmPhaseData: FullPhaseData = {
  id: 'gtm',
  journeyPosition: 3,
  journeyTotal: 5,
  name: 'Go-to-Market Fit',
  accentColor: '#FF3000',
  tagline: 'Go-to-Market Fit is the discipline of proving that customers can be reached, converted, and served through a repeatable motion. This phase is not about spending more on marketing. It is about finding the message, channel, sales process, and packaging that can produce predictable revenue without hiding weak unit economics.',
  subPhases: ['3A - Channel & Message', '3B - Sales Engine'],
  subPhasesData: [
    {
      id: 'gtm-a',
      label: '3A - Channel & Message',
      activities: [
        {
          id: 'channelTesting',
          title: 'Channel Testing & Prioritization',
          subtitle: 'organic, outbound, paid, partners, events, community',
          learnMore: 'Test a small number of channels with enough discipline to compare signal. A channel is not real because it produces one promising lead. It is real when the same motion can be repeated with a predictable cost, conversion rate, and customer quality. The goal is to narrow your focus, not expand it.',
          evidenceFields: [
            { id: 'channelsTested', label: 'channels tested', type: 'number', placeholder: '0' },
            { id: 'bestChannel', label: 'strongest channel', type: 'text', placeholder: 'which channel produced the clearest repeatable signal?' },
            { id: 'qualifiedPipeline', label: 'qualified pipeline created', type: 'number', placeholder: '0', unit: '$' },
            { id: 'channelDecision', label: 'channel decision', type: 'textarea', placeholder: 'which channels will you double down on, pause, or stop testing?' }
          ],
          ideamaitOpening: 'Tell me which channel produced the most qualified pipeline, not the most activity. We are looking for repeatability, conversion quality, and a cost profile that can survive scale.',
          secondaryAction: {
            label: 'Channel test planner',
            promptText: 'Help me design a Go-to-Market Fit channel testing plan that compares organic, outbound, paid, partnerships, events, and community against repeatability, cost, conversion rate, and customer quality.'
          }
        },
        {
          id: 'messagingArchitecture',
          title: 'Messaging Architecture',
          subtitle: 'pain, promise, proof, objection, urgency',
          learnMore: 'Build a messaging architecture that makes the customer pain, the product promise, the proof, the common objections, and the reason to act now clear. Strong messaging does not describe the product first. It names the problem in the customer voice, then connects that problem to a specific outcome the customer already wants.',
          evidenceFields: [
            { id: 'primaryPain', label: 'primary pain in customer words', type: 'text', placeholder: 'how customers describe the pain' },
            { id: 'corePromise', label: 'core promise', type: 'text', placeholder: 'the outcome your message promises' },
            { id: 'proofPoint', label: 'strongest proof point', type: 'text', placeholder: 'case study, metric, quote, or demo proof' },
            { id: 'topObjection', label: 'top objection', type: 'textarea', placeholder: 'what stops the buyer, and how do you answer it?' }
          ],
          ideamaitOpening: 'Write the sentence your best customer would use to describe the problem before they discovered you. If your message starts with your product, we need to move it closer to the pain.',
          secondaryAction: {
            label: 'Messaging architecture guide',
            promptText: 'Help me build a Go-to-Market Fit messaging architecture around customer pain, product promise, proof, objections, urgency, and segment-specific language.'
          }
        }
      ],
      deliverables: [
        { id: 'channelScorecard', title: 'A channel scorecard', description: 'A side-by-side comparison of tested channels using qualified pipeline, conversion quality, cost, and repeatability.' },
        { id: 'messageHouse', title: 'A message house', description: 'A documented hierarchy of pain, promise, proof, objections, and urgency that sales and marketing can reuse.' },
        { id: 'priorityChannelDecision', title: 'A priority-channel decision', description: 'A clear decision on which channel receives focus, which channels stay in testing, and which are stopped.' }
      ],
      exitMilestones: [
        { id: 'repeatableChannel', label: 'Repeatable channel', target: 'At least one channel produces repeatable qualified pipeline' },
        { id: 'messageConversion', label: 'Message conversion', target: 'Core message improves response or conversion rate' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Pursuing too many channels at once. A small team cannot learn from ten channels with enough depth to make good decisions.' },
        { severity: 'warning', text: 'Over-relying on paid advertising before the message, offer, and sales process are proven.' },
        { severity: 'watch', text: 'Mistaking impressions, clicks, or meetings for go-to-market signal. Qualified pipeline and conversion quality matter more.' }
      ],
      funding: [
        { label: 'Series A preparation - use capital for the repeatable revenue motion, not broad brand spend. Investors expect proof that a channel and sales process can scale with improving unit economics.', amount: '$3M-$12M' }
      ],
      teamShape: [
        'Founder-led sales',
        'growth or demand lead',
        'customer success owner',
        'sales operations support',
        'strong product feedback loop'
      ]
    },
    {
      id: 'gtm-b',
      label: '3B - Sales Engine',
      activities: [
        {
          id: 'pricingPackaging',
          title: 'Pricing & Packaging Refinement',
          subtitle: 'buyer, value metric, tiers, conversion, margin',
          learnMore: 'Refine pricing and packaging around the value customers actually receive and the way buyers naturally purchase. Pricing is not only a number. It is a signal about who the product is for, how value is measured, and what kind of customer relationship you are building.',
          evidenceFields: [
            { id: 'buyer', label: 'economic buyer', type: 'text', placeholder: 'who owns the budget?' },
            { id: 'valueMetric', label: 'value metric', type: 'text', placeholder: 'seat, usage, outcome, volume, or other metric' },
            { id: 'averageSalePrice', label: 'average sale price', type: 'number', placeholder: '0', unit: '$' },
            { id: 'pricingLearning', label: 'pricing learning', type: 'textarea', placeholder: 'what did buyers accept, resist, or ask to change?' }
          ],
          ideamaitOpening: 'Tell me what your buyer believes they are paying for. If your price is tied to your cost instead of the buyer value, the package is probably not ready to scale.',
          secondaryAction: {
            label: 'Pricing refinement framework',
            promptText: 'Help me refine pricing and packaging for Go-to-Market Fit around buyer type, value metric, tiers, conversion, gross margin, and willingness to pay.'
          }
        },
        {
          id: 'salesEngine',
          title: 'Build the Sales Engine',
          subtitle: 'pipeline, qualification, demo, proposal, close, handoff',
          learnMore: 'Build a sales engine with clear stages, qualification rules, demo structure, proposal process, objection handling, closing discipline, and customer-success handoff. A sales process becomes real when another person can run it and produce similar results without the founder inventing each step again.',
          evidenceFields: [
            { id: 'qualifiedOpportunities', label: 'qualified opportunities', type: 'number', placeholder: '0' },
            { id: 'salesCycleDays', label: 'sales cycle', type: 'number', placeholder: '0', unit: 'days' },
            { id: 'winRate', label: 'win rate', type: 'number', placeholder: '0', unit: '%' },
            { id: 'handoffRisk', label: 'handoff risk', type: 'textarea', placeholder: 'where does the process still depend on the founder?' }
          ],
          ideamaitOpening: 'Map the last deal you won from first contact to handoff. Where did the founder carry the process through personal force instead of a repeatable motion?',
          secondaryAction: {
            label: 'Sales engine blueprint',
            promptText: 'Help me build a repeatable sales engine for Go-to-Market Fit with qualification, demo, proposal, objection handling, closing, and customer-success handoff.'
          }
        }
      ],
      deliverables: [
        { id: 'pricingPackage', title: 'A refined pricing and packaging model', description: 'Documented tiers, buyer, value metric, average sale price, margin logic, and conversion learning.' },
        { id: 'salesPlaybook', title: 'A repeatable sales playbook', description: 'A clear sales process from lead qualification through demo, proposal, close, and customer-success handoff.' },
        { id: 'unitEconomicsModel', title: 'A unit economics model', description: 'CAC, LTV, payback, gross margin, win rate, and sales-cycle assumptions documented from actual evidence.' },
        { id: 'pipelineDashboard', title: 'A pipeline dashboard', description: 'A simple dashboard showing qualified opportunities, stage conversion, cycle length, win rate, and forecast confidence.' }
      ],
      exitMilestones: [
        { id: 'cacPredictable', label: 'CAC', target: 'Predictable within roughly 20%' },
        { id: 'salesCycleStable', label: 'Sales cycle', target: 'Stable at 20-45 days for B2B' },
        { id: 'ltvCacHealthy', label: 'LTV : CAC', target: 'At least 3:1' },
        { id: 'salesHandoff', label: 'Sales handoff', target: 'Another seller can run the process' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Hiring salespeople before product-market fit and before the founder can explain why deals close.' },
        { severity: 'warning', text: 'Scaling marketing before go-to-market fit. More leads into an unclear sales process create more noise, not more learning.' },
        { severity: 'watch', text: 'Treating pricing as a one-time decision rather than an evidence-backed system that evolves with customer value.' }
      ],
      funding: [
        { label: 'Series A - investors look for product-market fit, early repeatable sales, expanding pipeline, credible unit economics, and a clear use of funds for growth.', amount: '$3M-$12M' }
      ],
      teamShape: [
        'Founder-led sales remains active',
        'first sales hire or sales lead',
        'customer success owner',
        'marketing generalist',
        'sales operations discipline'
      ]
    }
  ]
};

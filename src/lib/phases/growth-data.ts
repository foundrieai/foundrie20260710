import { FullPhaseData } from '@/lib/phases/types';

export const growthPhaseData: FullPhaseData = {
  id: 'growth',
  journeyPosition: 4,
  journeyTotal: 5,
  name: 'Growth & Scale-Up',
  accentColor: '#FF3000',
  tagline: 'This is where a company becomes a real business. Scaling too early destroys companies; scaling at the right time creates category leaders. The goal is to turn your validated go-to-market engine into a high-performance, metrics-driven growth system that scales revenue, team, operations, and markets while maintaining or improving unit economics.',
  subPhases: ['4A - Revenue Engine & Org', '4B - Operational Maturity'],
  subPhasesData: [
    {
      id: 'growth-a',
      label: '4A - Revenue Engine & Org',
      activities: [
        {
          id: 'multiLayerSales',
          title: 'Build a Multi-Layer Sales Organization',
          subtitle: 'SDR → AE → CS · territories · quotas · forecasting',
          learnMore: 'A single-layer sales team cannot scale revenue predictably. Implement a handoff from sales development to account executives to customer success, with defined territories, quotas, commission plans, forecasting, pipeline hygiene, and enablement. For larger deals, add an enterprise motion that handles multi-stakeholder cycles of three to nine months. The structure is what produces predictability - without it, every quarter is a surprise rather than a forecast.',
          evidenceFields: [
            { id: 'accountExecutives', label: 'account executives on team', type: 'number', placeholder: '0' },
            { id: 'forecastAccuracy', label: 'forecast accuracy', type: 'number', placeholder: '0', unit: '%' },
            { id: 'enterpriseMotion', label: 'enterprise motion in place', type: 'text', placeholder: 'yes / no + typical deal cycle' },
            { id: 'handoffDocumented', label: 'is the SDR → AE → CS handoff documented', type: 'textarea', placeholder: 'describe the current handoff and where it depends on a specific person' }
          ],
          ideamaitOpening: 'Tell me how a lead moves through your team today, from first contact to closed deal to ongoing success. Where in that chain does the handoff break, or depend on one specific person rather than a documented process?',
          secondaryAction: {
            label: 'Sales org design template ↗',
            promptText: 'Help me design a multi-layer sales organization for the Growth phase: a sales development to account executive to customer success handoff, territories, quotas, commission plans, forecasting, pipeline hygiene, and an enterprise motion for multi-stakeholder deals.'
          }
        },
        {
          id: 'marketingEngine',
          title: 'Expand the Marketing Engine',
          subtitle: 'content · performance · lifecycle · brand · ABM · partnerships',
          learnMore: 'At scale, marketing stops being a single channel and becomes a system of compounding ones. Layer in content and search, performance marketing, lifecycle email automation, brand marketing, account-based marketing for enterprise, partnerships, and conferences at scale. Each layer should reinforce the others: content feeds search, brand lowers performance-marketing costs, account-based marketing concentrates effort on the accounts worth winning. The mistake is treating these as separate experiments rather than one engine.',
          evidenceFields: [
            { id: 'activeChannels', label: 'active marketing channels', type: 'number', placeholder: '0' },
            { id: 'topPipelineChannel', label: 'channel driving most pipeline', type: 'text', placeholder: 'which channel produces the most qualified pipeline?' },
            { id: 'cacTrend', label: 'CAC trend vs last quarter', type: 'text', placeholder: 'rising / flat / falling' }
          ],
          ideamaitOpening: 'Which of your marketing motions are actually compounding, and which are still one-off campaigns? Tell me where you are building an engine that reinforces itself versus where you are simply spending each month to start over.',
          secondaryAction: {
            label: 'Marketing engine framework ↗',
            promptText: 'Give me a framework for expanding a marketing engine in the Growth phase across content and search, performance marketing, lifecycle automation, brand, account-based marketing, and partnerships, and how to make the layers reinforce one another.'
          }
        },
        {
          id: 'customerSuccessScale',
          title: 'Strengthen Customer Success & Support',
          subtitle: 'tiers · churn prediction · renewal & expansion · NRR',
          learnMore: 'At scale, the cheapest revenue you will ever earn is expansion revenue from customers you already have. Create success tiers for small-business and enterprise customers, each with onboarding, quarterly reviews, renewal, and expansion playbooks, supported by churn prediction, satisfaction measurement, support-level tracking, and a customer community. Net revenue retention above 100 percent means your existing base grows even before you add a single new customer. That is the engine of durable growth.',
          evidenceFields: [
            { id: 'nrr', label: 'net revenue retention', type: 'number', placeholder: '0', unit: '%' },
            { id: 'enterpriseChurn', label: 'enterprise monthly churn', type: 'number', placeholder: '0', unit: '%' },
            { id: 'successTiers', label: 'success tiers defined', type: 'number', placeholder: '0' },
            { id: 'expansionPlay', label: 'strongest expansion play', type: 'text', placeholder: 'what drives expansion revenue today?' }
          ],
          ideamaitOpening: 'What is your net revenue retention right now? If it is above 100 percent, your base is compounding on its own and we should pour fuel on that. If it is below, that is the first thing we fix before spending another dollar on acquisition.',
          secondaryAction: {
            label: 'CS playbook framework ↗',
            promptText: 'Give me a customer success playbook framework for the Growth phase: success tiers for small-business and enterprise customers, onboarding, quarterly reviews, renewal and expansion playbooks, churn prediction, and driving net revenue retention above 110 percent.'
          }
        }
      ],
      deliverables: [
        { id: 'predictableGrowth', title: 'Predictable month-over-month or quarter-over-quarter revenue growth', description: 'Growth that can be forecast with confidence rather than hoped for, supported by consistent forecast accuracy.' },
        { id: 'nrrAbove100', title: 'Net revenue retention above 100% (ideally 110-130%)', description: 'Documented NRR proving the existing customer base expands faster than it churns.' },
        { id: 'formalLeadership', title: 'A formal leadership team', description: 'Vice-president-level leaders across sales, marketing, customer success, and engineering, with clear single-owner accountability.' },
        { id: 'multiChannelAcquisition', title: 'Multi-channel acquisition in operation', description: 'More than one acquisition channel performing predictably at the same time, with a predictable win rate, sales cycle, and average sale price.', linkedTool: 'founderOs', linkedToolLabel: 'Track your channel mix and growth metrics over time in Founder OS. Open Founder OS ↗' }
      ],
      exitMilestones: [
        { id: 'arrThreshold', label: 'ARR', target: '$10M+ ($5-7M for high-growth AI)' },
        { id: 'growthRate', label: 'Growth rate', target: '2-3x year over year' },
        { id: 'multiChannel', label: 'Acquisition', target: 'Multi-channel, in operation' },
        { id: 'expansionOffsetsChurn', label: 'Expansion vs churn', target: 'Expansion revenue offsets churn' },
        { id: 'leadershipIndependent', label: 'Leadership', target: 'No longer founder-dependent' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Adding headcount too quickly, or burning cash to buy unsustainable growth. Most scale-up deaths are self-inflicted rather than market-driven.' },
        { severity: 'warning', text: 'A dysfunctional structure built on the wrong vice-president hires. One bad senior hire can break an entire function for a year.' },
        { severity: 'watch', text: 'Underinvesting in customer success while pouring money into acquisition - filling a leaking bucket faster instead of sealing it.' }
      ],
      funding: [
        { label: 'Series B - commonly $10M to $40M. Investors look for two-to-three-times year-over-year growth, category ownership, strong unit economics, a repeatable sales engine, and a world-class leadership team.', amount: '$10M-$40M' },
        { label: 'Series C - commonly $40M to more than $100M, from growth funds, corporate venture arms, private-equity expansion funds, strategic investors, and venture debt. Watch cumulative dilution and the growing preference stack.', amount: '$40M-$100M+' }
      ],
      teamShape: [
        'CEO',
        'COO',
        'CTO',
        'CPO',
        'CRO',
        'CMO',
        'VP and director layer across every function'
      ]
    },
    {
      id: 'growth-b',
      label: '4B - Operational Maturity',
      activities: [
        {
          id: 'specializeRoles',
          title: 'Specialize Roles & Structure the Organization',
          subtitle: 'VP leaders · functional specialists · single-owner accountability',
          learnMore: 'The generalists who carried you here cannot run the company you are becoming. Hire vice-president-level leaders across sales, marketing, customer success, and engineering, and add specialists across the sales, success, product, operations, and data functions. The shift is from people who do everything to people who own one thing deeply. This can feel like a loss of the scrappy early culture, but it is the price of becoming a company that does not depend on any single person to function.',
          evidenceFields: [
            { id: 'vpLeaders', label: 'VP-level leaders in place', type: 'number', placeholder: '0' },
            { id: 'unownedFunctions', label: 'functions still lacking a clear owner', type: 'text', placeholder: 'which functions are shared or still on you?' },
            { id: 'clearestOwner', label: 'function with the clearest single owner', type: 'text', placeholder: 'where is accountability strongest?' }
          ],
          ideamaitOpening: 'List the functions in your company and tell me which ones have a clear, single, accountable owner and which are still shared or sitting with you. The shared ones are where things quietly break at scale.',
          secondaryAction: {
            label: 'Org structure guide ↗',
            promptText: 'Help me specialize roles and structure my organization for the Growth phase, identifying which vice-president-level leaders and functional specialists to add across sales, success, product, operations, and data, and in what order.'
          }
        },
        {
          id: 'expandProduct',
          title: 'Expand the Product Line',
          subtitle: 'modules · enterprise features · API · vertical & geographic',
          learnMore: 'A single product can carry you to scale, but rarely to category leadership. Add modules, enterprise features, integrations, an API ecosystem, white-label or reseller programs, and geographic or vertical expansion. The discipline here is sequencing - each expansion should open a new revenue line or defend an existing one, not merely add surface area. Expansion that dilutes focus is more dangerous at this stage than at any earlier one, because you now have the resources to pursue too many things at once.',
          evidenceFields: [
            { id: 'revenueLines', label: 'revenue lines beyond core product', type: 'number', placeholder: '0' },
            { id: 'promisingExpansion', label: 'most promising expansion', type: 'text', placeholder: 'which expansion has the strongest case?' },
            { id: 'resistedExpansion', label: 'expansion you are resisting and why', type: 'textarea', placeholder: 'what are you tempted to build that lacks a validated revenue line or competitive case?' }
          ],
          ideamaitOpening: 'Tell me the one product expansion you are most tempted to build right now. Then tell me which validated revenue line or competitive threat it addresses. If you cannot name one, we should talk about why you want to build it.',
          secondaryAction: {
            label: 'Product expansion framework ↗',
            promptText: 'Give me a product line expansion framework for the Growth phase covering modules, enterprise features, an API ecosystem, white-label and reseller programs, and geographic or vertical expansion, with criteria for sequencing each.'
          }
        },
        {
          id: 'matureInfrastructure',
          title: 'Mature Operational Infrastructure',
          subtitle: 'BI · financial controls · SOC 2 / ISO 27001 · procurement',
          learnMore: 'The infrastructure that carried you to Series A will break at scale. Implement data warehousing and business intelligence, financial controls, compliance certifications such as SOC 2 and ISO 27001, vendor management, objective-based performance management, and formal procurement. This work is invisible to customers and unglamorous to build, but its absence is what causes most scale-up failures. Operational discipline, not product, is what determines whether you become a category leader.',
          evidenceFields: [
            { id: 'soc2Status', label: 'SOC 2 status', type: 'text', placeholder: 'none / in progress / Type I / Type II' },
            { id: 'burnMultiple', label: 'burn multiple', type: 'number', placeholder: '0' },
            { id: 'closeTime', label: 'monthly close time', type: 'number', placeholder: '0', unit: 'days' },
            { id: 'infrastructureGap', label: 'biggest infrastructure gap', type: 'text', placeholder: 'what breaks first if you triple?' }
          ],
          ideamaitOpening: 'If you had to triple your customer count next quarter, what would break first - your data systems, your finance function, your security posture, or your support? Name the weakest link, because that is what currently caps your growth.',
          secondaryAction: {
            label: 'Readiness checklist ↗',
            promptText: 'Give me a scale-up operational readiness checklist covering data warehousing and business intelligence, financial controls, SOC 2 and ISO 27001, vendor management, objective-based performance management, and formal procurement.'
          }
        }
      ],
      deliverables: [
        { id: 'cacPayback', title: 'Acquisition-cost payback under 12 months (ideally 6-9)', description: 'A documented payback period proving acquisition efficiency at scale.' },
        { id: 'grossMargin', title: 'Gross margin above 70% for software (or category norm)', description: 'Margin discipline maintained through scaling, tracked alongside contribution and operating margin.' },
        { id: 'scalableProcesses', title: 'Scalable, documented processes across every function', description: 'Every core function runs on a documented, repeatable process rather than tribal knowledge.' },
        { id: 'cleanFinancials', title: 'Clean financials and a sound compliance posture', description: 'A full three-statement model, consistent forecast accuracy, and the security and privacy certifications enterprise deals require.', linkedTool: 'validationReport', linkedToolLabel: 'Review your financial model against scale-up benchmarks. Open report ↗' }
      ],
      exitMilestones: [
        { id: 'grossMarginHealthy', label: 'Gross margin', target: '>70% software (or category-aligned)' },
        { id: 'burnMultipleHealthy', label: 'Burn multiple', target: 'Under 1.5' },
        { id: 'churnHealthy', label: 'Monthly churn', target: '<5% SMB, <2% mid-market, <1% enterprise' },
        { id: 'infrastructureRobust', label: 'Infrastructure', target: 'Security, finance, HR robust' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Weak financial planning and controls. At this scale, you cannot manage what your finance function cannot see, and investors will not forgive unreliable numbers.' },
        { severity: 'warning', text: 'Losing product quality at scale, and technical debt that slows development. Both compound silently until they dominate every release.' },
        { severity: 'watch', text: 'Cultural breakdown as the team grows past the point where everyone knows everyone. Most failures here are operational, not market-driven.' }
      ],
      funding: [
        { label: 'Per-round dilution often narrows to ten to twenty percent as valuations rise. Venture debt can extend runway with less dilution, at the cost of covenants and repayment obligations, and some founders take partial liquidity through a secondary sale at this stage.', amount: 'Secondary liquidity possible' }
      ],
      teamShape: [
        'Full executive team',
        'VP and director layer across legal, finance, people, operations, and data',
        'legal and compliance function (in-house or fractional GC)',
        'disciplined cap-table administration'
      ]
    }
  ]
};

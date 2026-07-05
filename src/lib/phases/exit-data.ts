import { FullPhaseData } from '@/lib/phases/types';

export const exitPhaseData: FullPhaseData = {
  id: 'exit',
  journeyPosition: 5,
  journeyTotal: 5,
  name: 'Maturity & Exit-Readiness',
  accentColor: '#FF3000',
  tagline: 'Maturity is the point where the company can survive scrutiny, leadership transition, strategic diligence, and public-market expectations. Exit-readiness is not the same as deciding to sell. It is the discipline of building a business that has options because its governance, financials, operations, leadership, and category position are strong enough to be evaluated by outsiders.',
  subPhases: ['5A - Governance & Finance', '5B - Exit Pathway & People'],
  subPhasesData: [
    {
      id: 'exit-a',
      label: '5A - Governance & Finance',
      activities: [
        {
          id: 'governanceLeadership',
          title: 'Mature Governance & Executive Leadership',
          subtitle: 'board, controls, succession, operating cadence',
          learnMore: 'Mature governance creates the structure that lets the company make high-quality decisions without depending on founder instinct alone. Build a board cadence, executive operating rhythm, clear decision rights, succession planning, and risk oversight. A mature company can explain how decisions are made, who owns which risks, and what happens if a key leader steps away.',
          evidenceFields: [
            { id: 'boardCadence', label: 'board cadence', type: 'text', placeholder: 'monthly, quarterly, or other cadence' },
            { id: 'decisionRights', label: 'decision rights documented', type: 'text', placeholder: 'yes / no + where gaps remain' },
            { id: 'successionRisk', label: 'largest succession risk', type: 'textarea', placeholder: 'which leadership dependency would worry a buyer or board?' }
          ],
          ideamaitOpening: 'If a buyer or board asked how the company makes major decisions without you in the room, what evidence would you show them? That answer tells us how mature the governance system is.',
          secondaryAction: {
            label: 'Governance maturity checklist',
            promptText: 'Help me assess governance maturity for Maturity and Exit-Readiness across board cadence, decision rights, executive leadership, succession planning, and risk oversight.'
          }
        },
        {
          id: 'financialInfrastructure',
          title: 'Build Financial & Accounting Infrastructure',
          subtitle: 'audit-ready financials, controls, metrics, forecast quality',
          learnMore: 'Exit-readiness requires financials that can survive diligence. Build audit-ready statements, revenue recognition discipline, consistent SaaS metrics, financial controls, tax documentation, forecast accuracy, and a clean cap table. Diligence does not create weaknesses. It reveals the weaknesses the company already tolerated.',
          evidenceFields: [
            { id: 'arr', label: 'ARR', type: 'number', placeholder: '0', unit: '$' },
            { id: 'forecastAccuracy', label: 'forecast accuracy', type: 'number', placeholder: '0', unit: '%' },
            { id: 'auditReadiness', label: 'audit readiness', type: 'text', placeholder: 'not started / in progress / audit-ready' },
            { id: 'financeGap', label: 'largest financial diligence gap', type: 'textarea', placeholder: 'what would a buyer, banker, or auditor challenge first?' }
          ],
          ideamaitOpening: 'Name the financial number you would least want a buyer to question. That is probably the first place to strengthen documentation, controls, and ownership.',
          secondaryAction: {
            label: 'Diligence finance review',
            promptText: 'Help me review financial and accounting infrastructure for exit-readiness, including audit-ready statements, revenue recognition, SaaS metrics, forecast quality, tax, and cap-table hygiene.'
          }
        },
        {
          id: 'systemsPlatform',
          title: 'Scale Operations, Systems & Platform',
          subtitle: 'security, reliability, data, legal, procurement, documentation',
          learnMore: 'A mature company runs on systems, not heroics. Strengthen security, reliability, data governance, legal operations, procurement, vendor management, HR systems, documentation, and platform scalability. The company should be able to absorb diligence, growth, and leadership change without every answer living in a founder conversation.',
          evidenceFields: [
            { id: 'securityStatus', label: 'security posture', type: 'text', placeholder: 'SOC 2, ISO 27001, pen test, or other evidence' },
            { id: 'systemReliability', label: 'system reliability', type: 'text', placeholder: 'uptime, incident trend, or reliability evidence' },
            { id: 'documentationRisk', label: 'documentation risk', type: 'textarea', placeholder: 'which critical process is still tribal knowledge?' }
          ],
          ideamaitOpening: 'If diligence started tomorrow, which operational answer would still require someone to ask you personally? That is the system we need to turn into documentation and ownership.',
          secondaryAction: {
            label: 'Operational diligence checklist',
            promptText: 'Give me an operational maturity checklist for Maturity and Exit-Readiness covering security, reliability, data governance, legal operations, procurement, vendor management, HR systems, and documentation.'
          }
        }
      ],
      deliverables: [
        { id: 'governancePack', title: 'A governance and board-readiness pack', description: 'Board cadence, decision rights, executive ownership, risk register, and succession dependencies documented.' },
        { id: 'auditReadyFinancials', title: 'Audit-ready financial infrastructure', description: 'Clean financial statements, revenue recognition, forecast accuracy, tax documentation, and cap-table hygiene.' },
        { id: 'operationalDiligenceRoom', title: 'An operational diligence room', description: 'Security, reliability, legal, people, data, vendor, and system documentation organized for review.' }
      ],
      exitMilestones: [
        { id: 'ipoArr', label: 'IPO ARR', target: '$50M+ for IPO readiness' },
        { id: 'strategicArr', label: 'Strategic ARR', target: '$20M+ for strategic acquisition readiness' },
        { id: 'forecastReliable', label: 'Forecast quality', target: 'Consistent and explainable' },
        { id: 'leadershipDepth', label: 'Leadership depth', target: 'Company can operate beyond founder dependency' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Waiting for a transaction before cleaning financials, controls, contracts, and metrics. Diligence pressure makes weak infrastructure more expensive to fix.' },
        { severity: 'warning', text: 'Founder dependency hidden behind strong growth. Buyers and public-market investors discount companies that cannot operate without the founder.' },
        { severity: 'watch', text: 'Treating exit-readiness as a sale process rather than an operating discipline that creates optionality.' }
      ],
      funding: [
        { label: 'Late-stage growth, private equity, strategic capital, venture debt, secondary liquidity, or IPO preparation. The best option depends on growth rate, market conditions, category position, profitability, and founder goals.', amount: 'Option-dependent' }
      ],
      teamShape: [
        'CEO and independent executive leadership',
        'CFO or finance leader',
        'legal and compliance leadership',
        'board and committee cadence',
        'operational owners across every core function'
      ]
    },
    {
      id: 'exit-b',
      label: '5B - Exit Pathway & People',
      activities: [
        {
          id: 'exitPathway',
          title: 'Define the Exit Pathway',
          subtitle: 'IPO, strategic, private equity, secondary, remain private',
          learnMore: 'Exit-readiness means knowing which pathways are realistic and what each would require. IPO, strategic acquisition, private equity, secondary liquidity, and remaining private each reward different evidence. A company with options can choose timing. A company without options is forced to accept timing.',
          evidenceFields: [
            { id: 'preferredPathway', label: 'preferred pathway', type: 'text', placeholder: 'IPO, strategic, private equity, secondary, or remain private' },
            { id: 'mostLikelyBuyers', label: 'most likely buyers or capital partners', type: 'text', placeholder: 'strategics, sponsors, growth funds, public markets' },
            { id: 'pathwayGap', label: 'largest pathway gap', type: 'textarea', placeholder: 'what evidence is missing for the pathway you prefer?' }
          ],
          ideamaitOpening: 'Which exit pathway would create the most founder and company optionality, and which pathway is most realistic based on the evidence today? The gap between those answers is the work.',
          secondaryAction: {
            label: 'Exit pathway map',
            promptText: 'Help me map realistic exit pathways for Maturity and Exit-Readiness across IPO, strategic acquisition, private equity, secondary liquidity, and remaining private.'
          }
        },
        {
          id: 'categoryLeadership',
          title: 'Prove Category Leadership',
          subtitle: 'market position, defensibility, narrative, benchmarks',
          learnMore: 'Exit value depends on more than revenue. It depends on whether the market understands the category you lead, why you are defensible, and how your metrics compare with the best companies in the category. Category leadership turns financial performance into strategic value.',
          evidenceFields: [
            { id: 'categoryClaim', label: 'category claim', type: 'text', placeholder: 'what category do you lead or define?' },
            { id: 'defensibility', label: 'defensibility evidence', type: 'textarea', placeholder: 'data, network effects, workflow depth, brand, distribution, or switching costs' },
            { id: 'benchmarkStrength', label: 'strongest benchmark', type: 'text', placeholder: 'which metric compares best against top peers?' }
          ],
          ideamaitOpening: 'If a strategic buyer asked why your company matters beyond revenue, what category, defensibility, and benchmark evidence would you use?',
          secondaryAction: {
            label: 'Category leadership narrative',
            promptText: 'Help me build a category leadership narrative for Maturity and Exit-Readiness using market position, defensibility, benchmark metrics, and strategic value.'
          }
        },
        {
          id: 'peopleContinuity',
          title: 'Prepare People & Continuity',
          subtitle: 'retention, incentives, succession, culture, buyer confidence',
          learnMore: 'People risk can derail a transaction or weaken the company that remains. Prepare retention plans, incentive structures, succession coverage, cultural documentation, and continuity plans for key functions. The question is whether the people system gives an outside stakeholder confidence that value will continue after a major transition.',
          evidenceFields: [
            { id: 'keyPersonRisk', label: 'largest key-person risk', type: 'text', placeholder: 'which person leaving would create the largest risk?' },
            { id: 'retentionPlan', label: 'retention plan status', type: 'text', placeholder: 'none / drafted / approved / implemented' },
            { id: 'continuityPlan', label: 'continuity plan', type: 'textarea', placeholder: 'how will the company retain execution quality through a transition?' }
          ],
          ideamaitOpening: 'Which key person risk would a buyer notice first? We are going to turn that dependency into a retention, succession, or documentation plan.',
          secondaryAction: {
            label: 'People continuity plan',
            promptText: 'Help me prepare a people and continuity plan for Maturity and Exit-Readiness, including retention, incentives, succession, cultural continuity, and buyer confidence.'
          }
        }
      ],
      deliverables: [
        { id: 'exitPathwayMap', title: 'An exit pathway map', description: 'A realistic comparison of IPO, strategic acquisition, private equity, secondary liquidity, and remaining private.' },
        { id: 'categoryNarrative', title: 'A category leadership narrative', description: 'A clear story connecting market position, defensibility, benchmark strength, and strategic value.' },
        { id: 'peopleContinuityPlan', title: 'A people continuity plan', description: 'Retention, incentives, succession coverage, and key-person risk planning documented.' },
        { id: 'finalReadinessMemo', title: 'A final readiness memo', description: 'A concise founder memo describing the company evidence, gaps, pathway options, and next operating discipline.' }
      ],
      exitMilestones: [
        { id: 'nrrEnterprise', label: 'Enterprise NRR', target: '110-140%' },
        { id: 'categoryLeadership', label: 'Category leadership', target: 'Clear and defensible' },
        { id: 'pathwayOptions', label: 'Exit options', target: 'Multiple credible pathways' },
        { id: 'peopleContinuity', label: 'People continuity', target: 'Retention and succession risks addressed' }
      ],
      pitfalls: [
        { severity: 'critical', text: 'Optimizing for a transaction at the expense of the operating business. Durable options come from business quality, not process theater.' },
        { severity: 'warning', text: 'A weak category narrative that forces the company to be valued only on current revenue rather than strategic position.' },
        { severity: 'watch', text: 'Ignoring people continuity. The company must remain coherent through diligence, transition, and the next chapter.' }
      ],
      funding: [
        { label: 'Late-stage pathway selection - evaluate capital and exit paths against founder goals, dilution, control, timing, employee outcomes, and long-term company durability.', amount: 'Strategic choice' }
      ],
      teamShape: [
        'Executive team with durable ownership',
        'CFO and legal leadership',
        'people and talent leadership',
        'board and investor relations discipline',
        'transaction advisors only when the company is operationally ready'
      ]
    }
  ]
};

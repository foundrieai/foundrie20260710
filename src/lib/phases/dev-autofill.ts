import type { ActivityData, FullPhaseData } from './types';

function sampleValueForField(activity: ActivityData, field: ActivityData['evidenceFields'][number]) {
  if (field.type === 'number') {
    if (field.id.toLowerCase().includes('conversion')) return 12;
    if (field.id.toLowerCase().includes('total')) return 24;
    if (field.id.toLowerCase().includes('count')) return 10;
    return 5;
  }

  if (field.type === 'textarea') {
    return `Dev test evidence for ${activity.subtitle}: a concise synthetic note with customer behavior, observed friction, and a clear next validation signal.`;
  }

  return `Dev test ${field.label}`;
}

export function buildDevAutofillPhaseState(phaseData: FullPhaseData) {
  const filledAt = new Date().toISOString();

  return phaseData.subPhasesData.reduce<Record<string, any>>((phaseState, subPhase) => {
    const activities = Object.fromEntries(
      subPhase.activities.map((activity) => [
        activity.id,
        {
          status: 'accepted',
          evidence: Object.fromEntries(
            activity.evidenceFields.map((field) => [field.id, sampleValueForField(activity, field)])
          ),
          aiAssessment: {
            signal: 'strong',
            confidence: 92,
            rationale: 'Development autofill created a strong synthetic signal so the admin account can test downstream phase behavior.',
            gaps: [],
            recommendedStatus: 'ready-to-accept',
            assessedAt: filledAt,
          },
          founderDecision: 'accepted',
          isOverride: false,
          auditTrail: [
            {
              at: filledAt,
              event: 'accepted',
              detail: 'Development autofill accepted this activity for admin testing.',
            },
          ],
        },
      ])
    );

    const deliverables = Object.fromEntries(
      subPhase.deliverables.map((deliverable) => [
        deliverable.id,
        {
          completed: true,
          completedAt: filledAt,
          devAutofilled: true,
        },
      ])
    );

    const milestones = Object.fromEntries(
      subPhase.exitMilestones.map((milestone) => [milestone.id, true])
    );

    phaseState[subPhase.id] = {
      activities,
      deliverables,
      milestones,
      devAutofilledAt: filledAt,
    };

    return phaseState;
  }, {});
}

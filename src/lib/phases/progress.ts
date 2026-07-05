import type { FullPhaseData } from './types';

export function isActivityAccepted(activityState: any): boolean {
  return activityState?.founderDecision === 'accepted' || activityState?.founderDecision === 'overridden';
}

export function getCompletedPhaseItems(phaseData: FullPhaseData, phaseState: any, type: 'activities' | 'deliverables') {
  const completed: string[] = [];
  phaseData.subPhasesData.forEach((subPhase) => {
    subPhase[type].forEach((item) => {
      if (type === 'activities' && isActivityAccepted(phaseState?.[subPhase.id]?.activities?.[item.id])) {
        completed.push(item.id);
      } else if (type === 'deliverables' && phaseState?.[subPhase.id]?.deliverables?.[item.id]?.completed) {
        completed.push(item.id);
      }
    });
  });
  return completed;
}

export function getRemainingPhaseItems(phaseData: FullPhaseData, phaseState: any, type: 'activities' | 'deliverables') {
  const remaining: string[] = [];
  phaseData.subPhasesData.forEach((subPhase) => {
    subPhase[type].forEach((item) => {
      if (type === 'activities' && !isActivityAccepted(phaseState?.[subPhase.id]?.activities?.[item.id])) {
        remaining.push(item.id);
      } else if (type === 'deliverables' && !phaseState?.[subPhase.id]?.deliverables?.[item.id]?.completed) {
        remaining.push(item.id);
      }
    });
  });
  return remaining;
}

export function getMilestoneCounts(phaseData: FullPhaseData, phaseState: any) {
  let met = 0;
  let total = 0;
  const metIds: string[] = [];
  const remainingIds: string[] = [];

  phaseData.subPhasesData.forEach((subPhase) => {
    subPhase.exitMilestones.forEach((milestone) => {
      total++;
      if (phaseState?.[subPhase.id]?.milestones?.[milestone.id]) {
        met++;
        metIds.push(milestone.id);
      } else {
        remainingIds.push(milestone.id);
      }
    });
  });

  return { met, total, metIds, remainingIds };
}

export function getPhaseProgress(phaseData: FullPhaseData, phaseState: any) {
  const completedActivities = getCompletedPhaseItems(phaseData, phaseState, 'activities');
  const remainingActivities = getRemainingPhaseItems(phaseData, phaseState, 'activities');
  const completedDeliverables = getCompletedPhaseItems(phaseData, phaseState, 'deliverables');
  const remainingDeliverables = getRemainingPhaseItems(phaseData, phaseState, 'deliverables');
  const milestones = getMilestoneCounts(phaseData, phaseState);

  const totalActivities = completedActivities.length + remainingActivities.length;
  const totalDeliverables = completedDeliverables.length + remainingDeliverables.length;

  const activityPct = totalActivities > 0 ? (completedActivities.length / totalActivities) * 100 : 0;
  const deliverablePct = totalDeliverables > 0 ? (completedDeliverables.length / totalDeliverables) * 100 : 0;
  const milestonePct = milestones.total > 0 ? (milestones.met / milestones.total) * 100 : 0;
  const masterProgress = (activityPct * 0.3) + (deliverablePct * 0.4) + (milestonePct * 0.3);

  return {
    activityPct,
    deliverablePct,
    milestonePct,
    masterProgress,
    completedActivities,
    remainingActivities,
    completedDeliverables,
    remainingDeliverables,
    milestonesMet: milestones.metIds,
    milestonesRemaining: milestones.remainingIds,
  };
}

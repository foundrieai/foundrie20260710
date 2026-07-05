'use client';

import { collection, doc, increment, serverTimestamp, setDoc, updateDoc, type Firestore } from 'firebase/firestore';
import { useFirestore, useUser } from './provider';
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from './non-blocking-updates';
import type {
    DecisionLogEntry,
    EvidenceItem,
    EvidenceSource,
    EvidenceTags,
    EvidenceStrength,
    ExtractedEvidence
} from '@/lib/types';

export const useDeleteReport = () => {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const deleteReport = (reportId: string) => {
        if (!user) {
            console.error("User must be logged in to delete a report.");
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to delete a report.'
            });
            return;
        }
        const reportDocRef = doc(firestore, 'users', user.uid, 'reports', reportId);
        deleteDocumentNonBlocking(reportDocRef);

        const userDocRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userDocRef, {
            reportsGenerated: increment(-1)
        });

        toast({
            title: 'Report Deleted',
            description: 'The report has been successfully deleted.'
        });
    };

    return deleteReport;
}

export interface CreateEvidenceInput {
    source: EvidenceSource;
    rawContent: string;
    storagePath?: string;
    extracted: ExtractedEvidence | null;
    tags?: EvidenceTags;
    strength: EvidenceStrength;
}

export function getEvidenceCollectionRef(firestore: Firestore, userId: string) {
    return collection(firestore, 'users', userId, 'evidence');
}

export function getEvidenceDocRef(firestore: Firestore, userId: string, evidenceId: string) {
    return doc(firestore, 'users', userId, 'evidence', evidenceId);
}

export async function createEvidenceItem(
    firestore: Firestore,
    userId: string,
    input: CreateEvidenceInput
): Promise<string> {
    const evidenceRef = doc(getEvidenceCollectionRef(firestore, userId));
    const evidence: Omit<EvidenceItem, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
        id: evidenceRef.id,
        createdAt: serverTimestamp(),
        source: input.source,
        rawContent: input.rawContent,
        ...(input.storagePath ? { storagePath: input.storagePath } : {}),
        extracted: input.extracted,
        tags: input.tags || {},
        strength: input.strength,
    };

    await setDoc(evidenceRef, evidence);
    return evidenceRef.id;
}

export async function updateEvidenceExtraction(
    firestore: Firestore,
    userId: string,
    evidenceId: string,
    extracted: ExtractedEvidence
) {
    await updateDoc(getEvidenceDocRef(firestore, userId, evidenceId), { extracted });
}

export interface CreateDecisionInput {
    phaseId?: string;
    title: string;
    rationale: string;
    supportingEvidenceIds: string[];
    optionsRejected: string[];
    knownRisks: string[];
    decidedBy: string;
}

export function getDecisionsCollectionRef(firestore: Firestore, userId: string) {
    return collection(firestore, 'users', userId, 'decisions');
}

export function getDecisionDocRef(firestore: Firestore, userId: string, decisionId: string) {
    return doc(firestore, 'users', userId, 'decisions', decisionId);
}

export async function createDecisionLogEntry(
    firestore: Firestore,
    userId: string,
    input: CreateDecisionInput
): Promise<string> {
    const decisionRef = doc(getDecisionsCollectionRef(firestore, userId));
    const decision: Omit<DecisionLogEntry, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
        id: decisionRef.id,
        createdAt: serverTimestamp(),
        ...(input.phaseId ? { phaseId: input.phaseId } : {}),
        title: input.title,
        rationale: input.rationale,
        supportingEvidenceIds: input.supportingEvidenceIds,
        optionsRejected: input.optionsRejected,
        knownRisks: input.knownRisks,
        decidedBy: input.decidedBy,
    };

    await setDoc(decisionRef, decision);
    return decisionRef.id;
}

export async function updateDecisionOutcome(
    firestore: Firestore,
    userId: string,
    decisionId: string,
    outcomeNote: string
) {
    await updateDoc(getDecisionDocRef(firestore, userId, decisionId), {
        outcomeNote,
        outcomeUpdatedAt: serverTimestamp(),
    });
}

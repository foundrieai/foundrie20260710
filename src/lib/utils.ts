import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeForMatch(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripTrackingMarkers(text: string): string {
  if (!text) return ''
  return text
    .replace(/@@ADDED_SUPPORTED:[^:@]+:([^@]+)@@/g, '$1')
    .replace(/@@ADDED_UNSUPPORTED:[^:@]+:([^@]+)@@/g, '$1')
    .replace(/@@ADDED_SUPPORTED:([^@]+)@@/g, '$1')
    .replace(/@@ADDED_UNSUPPORTED:([^@]+)@@/g, '$1')
    .replace(/@@ADDED_MISSING:([^@]+)@@/g, '$1')
    .replace(/@@REMOVED_EXTRA:([^@]+)@@/g, '')
}

export function generateAtsFilename(
  candidateName: string,
  jobTitle: string,
  extension: 'pdf' | 'docx' | 'txt'
): string {
  const cleanName = (candidateName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-')

  const cleanTitle = (jobTitle || 'Resume')
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-')

  const base = `${cleanName || 'Candidate'}-${cleanTitle || 'Resume'}-Resume`
  return `${base.length > 60 ? base.substring(0, 60) : base}.${extension}`
}

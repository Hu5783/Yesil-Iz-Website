export const SECTIONS = [
  { id: 'better-parks', label: 'Better Parks' },
  { id: 'healthy-trees', label: 'Healthy Trees' },
  { id: 'clean-coast', label: 'Clean Coast' },
  { id: 'project-green', label: 'Project Green' },
  { id: 'getting-involved', label: 'Getting Involved' },
  { id: 'green-journal', label: 'Green Journal' },
  { id: 'weekly-knowledge', label: 'Weekly Knowledge' },
  { id: 'support', label: 'Support' },
  { id: 'rewards', label: 'Rewards' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
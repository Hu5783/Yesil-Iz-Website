export const SECTIONS = [
  'better-parks', 'healthy-trees', 'clean-coast', 'project-green',
  'getting-involved', 'green-journal', 'weekly-knowledge', 'support', 'rewards',
] as const;

export type Section = (typeof SECTIONS)[number];

export interface Entry {
  id: number;
  section: Section;
  title: string;
  content: string;
  date: string;
}
export type NewEntry = Omit<Entry, 'id' | 'date'>;

export interface NewVolunteer {
  name: string;
  email: string;
  message: string;
  consent: true;
}
export interface Volunteer extends NewVolunteer {
  id: number;
  date: string;
}
import { Entry, NewEntry, Section, Volunteer, NewVolunteer } from './types';

const entries: Entry[] = [];
const volunteers: Volunteer[] = [];
let nextEntryId = 1;
let nextVolunteerId = 1;

const today = (): string => new Date().toISOString().slice(0, 10);

export async function listEntries(section: Section): Promise<Entry[]> {
  return entries.filter((e) => e.section === section).sort((a, b) => b.id - a.id);
}

export async function addEntry(input: NewEntry): Promise<Entry> {
  const entry: Entry = {
    id: nextEntryId++,
    date: today(),
    section: input.section,
    title: input.title.trim(),
    content: input.content.trim(),
  };
  entries.push(entry);
  return entry;
}

export async function deleteEntry(id: number): Promise<boolean> {
  const i = entries.findIndex((e) => e.id === id);
  if (i === -1) return false;
  entries.splice(i, 1);
  return true;
}

export async function addVolunteer(input: NewVolunteer): Promise<Volunteer> {
  const volunteer: Volunteer = {
    id: nextVolunteerId++,
    date: today(),
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    consent: true,
  };
  volunteers.push(volunteer);
  return volunteer;
}

export async function listVolunteers(): Promise<Volunteer[]> {
  return [...volunteers].reverse();
}
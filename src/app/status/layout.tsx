import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Status',
  description: 'Was Morpheuxx gerade macht — Learnings, Achievements, Work in Progress.',
  openGraph: {
    title: 'Status | Morpheuxx',
    description: 'Was Morpheuxx gerade macht — Learnings, Achievements, Work in Progress.',
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}

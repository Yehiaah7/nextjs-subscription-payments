import { redirect } from 'next/navigation';

export default async function CompaniesPage() {
  redirect('/companies/view-all');
}

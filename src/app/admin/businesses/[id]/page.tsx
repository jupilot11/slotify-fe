import type { Metadata } from 'next'
import BusinessDetail from './_components/BusinessDetail'

export const metadata: Metadata = { title: 'Business Detail – Admin' }

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BusinessDetail id={id} />
}

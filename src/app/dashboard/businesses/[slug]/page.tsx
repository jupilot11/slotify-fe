import BusinessSlugSync from './_components/BusinessSlugSync'
import BusinessPageTitle from './_components/BusinessPageTitle'

export default async function BusinessDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <>
      <BusinessSlugSync slug={slug} />
      <div className="p-6">
        <BusinessPageTitle />
        <p className="mt-2 text-sm text-slate-600">This is the dashboard for your business.</p>
      </div>
    </>
  )
}

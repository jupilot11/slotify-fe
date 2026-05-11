export default async function BusinessDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Business Dashboard</h1>
      <p className="text-sm text-slate-500 font-mono">{slug}</p>
    </div>
  )
}

import BusinessSlugSync from './_components/BusinessSlugSync'

export default async function BusinessSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <>
      <BusinessSlugSync slug={slug} />
      {children}
    </>
  )
}

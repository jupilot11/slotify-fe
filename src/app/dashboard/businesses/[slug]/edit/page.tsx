import EditBusinessForm from './_components/EditBusinessForm'

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <EditBusinessForm slug={slug} />
}

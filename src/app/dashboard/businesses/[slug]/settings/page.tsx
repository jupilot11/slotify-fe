import SettingsForm from './_components/SettingsForm'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <SettingsForm slug={slug} />
}

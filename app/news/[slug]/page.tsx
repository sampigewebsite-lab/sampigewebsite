import { redirect } from 'next/navigation'

export default async function NewsSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/blogs/${slug}`)
}
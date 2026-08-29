import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { isAuthenticated } = await auth()
  if (isAuthenticated) redirect('/overview')
  return <div>Hello — public landing</div>
}
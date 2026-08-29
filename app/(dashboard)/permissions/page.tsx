import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserRole, hasAccess } from '@/lib/roles'

export default async function PermissionsPage() {
  // 1) Auth gate — must be signed in, otherwise Clerk redirects to /sign-in
  await auth.protect()

  // 2) Get Clerk id — needed to query DB
  const { userId } = await auth()
  const role = await getUserRole(userId!)

  // 3) Null-role guard — handles webhook race: user signed in via Clerk but User row not yet created
  // lib/roles.ts:30 returns null → redirect to sign-in instead of crashing hasAccess
  if (!role) redirect('/sign-in')

  // 4) Role gate — lib/roles.ts:40 requires >= ADMIN (rank 3)
  // GUEST:0 MEMBER:1 MANAGER:2 → false → sent to /overview, OWNER:4 ADMIN:3 → true
  if (!hasAccess(role, '/permissions')) redirect('/overview')

  // 5) Placeholder — Module 9 will replace with permission matrix UI
  // Showing {role} helps manual testing: switch role in Prisma Studio → refresh → verify gate
  return <h1>Permissions — {role}</h1>
}

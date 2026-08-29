import { auth } from '@clerk/nextjs/server' // Clerk server helper — same as overview
import { redirect } from 'next/navigation' // server redirect for role failures
import { getUserRole, hasAccess } from '@/lib/roles' // ROLE_RANK check from lib/roles.ts:37

export default async function MembersPage() {
  // 1) Auth gate — must be signed in, otherwise Clerk redirects to /sign-in
  await auth.protect()

  // 2) Get Clerk id — needed to query DB
  const { userId } = await auth()
  const role = await getUserRole(userId!)

  // 3) Null-role guard — handles webhook race: user signed in via Clerk but User row not yet created
  // lib/roles.ts:30 returns null → redirect to sign-in instead of crashing hasAccess
  if (!role) redirect('/sign-in')

  // 4) Role gate — lib/roles.ts:37 requires >= MEMBER (rank 1)
  // GUEST:0 → false → sent to /overview (safe landing), all others → true → sees page
  if (!hasAccess(role, '/members')) redirect('/overview')

  // 5) Placeholder — Module 7 will replace with prisma.user.findMany({ where: { orgId } }) table
  // Showing {role} helps manual testing: switch role in Prisma Studio → refresh → verify gate
  return <h1>Members — {role}</h1>
}

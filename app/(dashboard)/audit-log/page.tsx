import { auth } from '@clerk/nextjs/server' // Clerk server helper — same as overview
import { redirect } from 'next/navigation' // server redirect for role failures
import { getUserRole, hasAccess } from '@/lib/roles' // ROLE_RANK check from lib/roles.ts:43

export default async function AuditLogPage() {
  // 1) Auth gate — must be signed in, otherwise Clerk redirects to /sign-in
  await auth.protect()

  // 2) Get Clerk id — needed to query DB
  const { userId } = await auth()
  const role = await getUserRole(userId!)

  // 3) Null-role guard — handles webhook race: user signed in via Clerk but User row not yet created
  // lib/roles.ts:30 returns null → redirect to sign-in instead of crashing hasAccess
  if (!role) redirect('/sign-in')

  // 4) Role gate — lib/roles.ts:43 requires >= ADMIN (rank 3)
  // GUEST:0 MEMBER:1 MANAGER:2 → false → sent to /overview, OWNER:4 ADMIN:3 → true
  if (!hasAccess(role, '/audit-log')) redirect('/overview')

  // 5) Placeholder — Module 10 will replace with audit log table
  // Showing {role} helps manual testing: switch role in Prisma Studio → refresh → verify gate
  return <h1>Audit Log — {role}</h1>
}

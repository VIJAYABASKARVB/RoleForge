import { auth } from '@clerk/nextjs/server' 
import { redirect } from 'next/navigation' 
import { getUserRole, hasAccess } from '@/lib/roles' 

// Server Component — runs on server before HTML is sent, so unauthenticated users never see the page
export default async function Overview() {
  // 1) Auth gate (Option B resource-based) — replaces old proxy createRouteMatcher gate (deprecated)
  // Throws redirect to /sign-in if not signed in, otherwise continues
  await auth.protect()

  // 2) Get Clerk's userId (e.g., user_2xAbc...) — clerkId maps to DB User.clerkId (prisma/schema.prisma:36)
  const { userId } = await auth()

  // 3) Bridge Clerk → app role — looks up User.role via lib/roles.ts:26 getUserRole → OWNER/ADMIN/MANAGER/MEMBER/GUEST
  const role = await getUserRole(userId!)

  // 4) Role gate — lib/roles.ts:34 '/overview' always true, so this never redirects here
  // Kept for consistency — copy-paste to /members will block GUEST, /permissions will block <ADMIN
  if (!hasAccess(role!, '/overview')) redirect('/overview')

  // 5) Render — only reached if both gates pass
  return <h1>This is the Overview Page</h1>
}

import { auth } from '@clerk/nextjs/server'

// Shared gate for all (dashboard) routes — Module 5 minimal, Module 6 will add sidebar
// Ensures every dashboard page is at least signed-in; individual pages handle role via hasAccess
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auth gate for whole group — replaces old proxy auth gate (deprecated createRouteMatcher)
  await auth.protect()
  return <>{children}</>
}

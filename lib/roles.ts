// What role does this user have?
// Is this role allowed to access this route?

import type { Role } from "./generated/prisma/client";
import { prisma } from "@/lib/prisma";


export type{Role};

export const ROLE_RANK:Record<Role,number> = {
  GUEST:0,
  MEMBER:1,
  MANAGER:2,
  ADMIN:3,
  OWNER:4
}

export const ROLE_HIERARCHY: Role[] = [
  "GUEST",
  "MEMBER",
  "MANAGER",
  "ADMIN",
  "OWNER",
];

export async function getUserRole(clerkId:string) : Promise<Role|null> {
  const user = await prisma.user.findUnique({
    where:{clerkId},
  });
  return user?.role ?? null;
}

export function hasAccess(role:Role,route:string):boolean{
  if(route.startsWith("/overview")){
    return true;
  }
  if(route.startsWith("/members")){
    return ROLE_RANK[role] >= ROLE_RANK.MEMBER;
  }
  if(route.startsWith("/permissions")){
    return ROLE_RANK[role] >= ROLE_RANK.ADMIN;
  }
  if(route.startsWith("/audit-log")){
    return ROLE_RANK[role] >= ROLE_RANK.ADMIN;
  }

  return true;
}
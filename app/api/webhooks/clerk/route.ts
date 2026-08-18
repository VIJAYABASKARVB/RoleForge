import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function POST(request:Request) {
  const {data,type} = await request.json();
  try{
      if(type === "organization.created"){
        await prisma.organization.upsert({
          where:{clerkOrgId:data.id},
          create:{clerkOrgId:data.id,name:data.name},
          update:{}
        })
      }
  }
  catch(err){
    console.error(err);
  }
  return NextResponse.json({ok:true});
}
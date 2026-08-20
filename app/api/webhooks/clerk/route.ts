import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
 import { Webhook } from "svix"


export async function POST(request:Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if(!secret){
    throw new Error("Missing CLERK_WEBHOOK_SECRET in env");
  }
  const wh = new Webhook(secret);
  const rawBody = await request.text();
  const {data,type} = await JSON.parse(rawBody);
  try{
    wh.verify(rawBody, Object.fromEntries(request.headers));
  }catch(error){
    console.error(error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  // Oganization Creation
  try{
      if(type === "organization.created"){
        await prisma.organization.upsert({
          where:{clerkOrgId:data.id},
          create:{clerkOrgId:data.id,name:data.name},
          update:{}
        })
      }

      if(type === "user.created"){
        await prisma.user.upsert({
          where:{clerkId:data.id},
          create:{
            clerkId:data.id,
            email:data.email_addresses[0].email_address,
            name: [data.first_name, data.last_name].filter(Boolean).join(" "),
          },
          update:{}
        })
      }

      if(type === "organizationMembership.created"){
        const org = await prisma.organization.findUnique({
          where:{clerkOrgId:data.organization.id}
        })
        if(!org){
          console.warn("Organization not found for clerkOrgId:", data.organization.id);
        }else{
          await prisma.user.upsert({
            where:{clerkId: data.public_user_data.user_id},
            create:{
              orgId:org.id,
              clerkId:data.public_user_data.user_id,
              email:data.public_user_data.identifier,
              name:[data.public_user_data.first_name, data.public_user_data.last_name].filter(Boolean).join(" "),
              role:"OWNER"
            },
            update:{role:"OWNER",orgId:org.id}
          })
        }
      }
  }
  catch(err){
    console.error(err);
  }
  return NextResponse.json({ok:true});
}
"use server";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@repo/libs";
import {signupSchema} from "@repo/zod/schema/signup"
import {createOrgSchema} from "@repo/zod/schema/createOrg"
import {prisma} from "@repo/prisma/client";
import { generateTokenAndSendEmail  } from "@repo/emails/templates/tokenEmailVerificationTemp/generateTokenAndSendEmail";
import { redirect } from "next/navigation";

export async function createAccount(prevState: { message: string; success: boolean}, formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")
  const businessName = formData.get("businessName")?.toString()!
  const parse = signupSchema.safeParse({email, password})


  if(!parse.success){
      return  { message: "Email or password is missing", success: false }
  }
  const userEmail =  email?.toString().toLowerCase()!
  const hashedPassword = await hashPassword(password as string);

  const isUserExisting = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  })


  if(isUserExisting){
    return  { message: "Email is already taken", success: false }
 }


 await prisma.user.create({
  data: {
      email: userEmail,
      password: hashedPassword,
     role: "ADMIN"
    }
})

const org = await prisma.org.create({data:{
  name:businessName
}})

await prisma.user.update({
  where: {
    email: userEmail,
  },
  data: {
      orgId: org.id,
    },
});

await generateTokenAndSendEmail({
email: userEmail,
}).catch((error) => console.error(error))




 return  redirect(`/auth/email-sent?email=${userEmail}`)
}

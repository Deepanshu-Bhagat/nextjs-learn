'use server'
import { z } from "zod";
import { sql } from '@vercel/postgres';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(), 
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending' , 'paid']) ,
  date: z.string()
});

const CreateInvoice = FormSchema.omit({ id: true, date: true}) 
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export const createInvioce = async (formData:FormData)=>{
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }

  const {customerId, amount ,status} = CreateInvoice.parse(rawFormData)
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  //.parse(rawFormData)

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `
   revalidatePath('/dashboard/invoices')
   redirect('/dashboard/invoices')
}

export const updateInvoice = async (id: string ,formData: FormData)=>{
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }

  const { customerId, amount ,status} = UpdateInvoice.parse(rawFormData)
  const amountInCents = amount * 100

  await sql`
    UPDATE invoices 
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

   revalidatePath('/dashboard/invoices')
   redirect('/dashboard/invoices')
}

export const deleteInvoice = async (id: string)=>{
  await sql`
    DELETE from invoices 
    WHERE id = ${id}
  `;

   revalidatePath('/dashboard/invoices')
}
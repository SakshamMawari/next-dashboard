'use server';
import {z} from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import currentPage from 'app/dashboard/invoices/page'
const FormSchema=z.object({
    id:z.string(),
    customerId:z.string(),
    amount:z.coerce.number(),
    status:z.enum(['pending','paid']),
    date:z.string(),
})

// CreateInvoice is ready with zod validation
const CreateInvoice=FormSchema.omit({id:true,date:true}) 

const sql=postgres(process.env.SUPABASE_POSTGRES_URL!,{ssl:'require'})
export async function createInvoice(FormData:FormData){
const {customerId,amount,status}=CreateInvoice.parse({
    customerId:FormData.get('customerId'),
    amount:FormData.get('amount'),
    status:FormData.get('status'),
})
// Storing value in cents;
const amountInCents=amount*100;
const date=new Date().toISOString().split('T')[0];


await sql`
INSERT INTO invoices (customer_id,amount,status,date) VALUES (${customerId},${amountInCents},${status},${date})`;
// after storing the data we can redirect the data to invoice page
revalidatePath('/app/dashboard/invoices');
redirect('/dashboard/invoices')
} 


// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try{
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  }
  catch(err){
      redirect(`/dashboard/error/`);
    }
    //  const currentPage=Number(formData.get('currentPage'))||1
    
    revalidatePath('/dashboard/invoices/');
    redirect(`/dashboard/invoices/`);
}

// Deleting the invoices
export async function deleteInvoice(id: string) {
    console.log('There is some error');
    
    // throw new Error('Cannot delete the invoice')
    
    try{
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        redirect(`/dashboard/invoices/`);

  }
catch(error){
    revalidatePath('/dashboard/error')
}
}


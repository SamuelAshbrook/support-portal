import prisma from "@/app/lib/prisma";
import { createCompany } from "./actions";

export default async function CompaniesPage() {
    const companies = await prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { users: true, tickets: true } } },
    });

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Companies</h1>

            <form action={createCompany} className="flex gap-2">
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Company Name" 
                    className="w-full rounded-md border border-zinc-300 p-2" 
                />
                <button className="w-full rounded-md bg-blue-500 text-white p-2">
                    Create Company
                </button>
            </form>

            <ul className="divide-y divide-zinc-200 ">
                {companies.map((company) => (
                    <li key={company.id} className="flex justify-between items-center p-4">
                        <span>{company.name}</span>
                        <span className="text-sm">
                            {company._count.users} users, {company._count.tickets} tickets
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
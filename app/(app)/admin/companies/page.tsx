import prisma from "@/app/lib/prisma";
import { CreateCompanyForm } from "./create-company-form";

export default async function CompaniesPage() {
    const companies = await prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { users: true, tickets: true } } },
    });

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Companies</h1>

            <CreateCompanyForm />

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
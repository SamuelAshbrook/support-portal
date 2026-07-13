import prisma from "@/app/lib/prisma";
import { CompanyListItem } from "./company-list-item";
import { CreateCompanyForm } from "./create-company-form";

export default async function CompaniesPage() {
    const companies = await prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { users: true, tickets: true, timesheets: true } },
        },
    });

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Companies</h1>

            <CreateCompanyForm />

            <ul className="divide-y divide-zinc-200">
                {companies.map((company) => (
                    <CompanyListItem
                        key={company.id}
                        id={company.id}
                        name={company.name}
                        addressLine1={company.addressLine1}
                        addressLine2={company.addressLine2}
                        townCity={company.townCity}
                        countyState={company.countyState}
                        postcodeZip={company.postcodeZip}
                        country={company.country}
                        billingRate={company.billingRate.toFixed(2)}
                        userCount={company._count.users}
                        ticketCount={company._count.tickets}
                        timesheetCount={company._count.timesheets}
                    />
                ))}
            </ul>
        </div>
    );
}

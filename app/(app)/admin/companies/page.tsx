import { AddCompanyButton } from "./add-company-button";
import { CompanyRow } from "./company-row";
import prisma from "@/app/lib/prisma";

export default async function CompaniesPage() {
    const companies = await prisma.company.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { users: true, tickets: true, timesheets: true } },
        },
    });

    return (
        <div className="min-h-full bg-[#f3f4f6] p-6">
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 px-6 py-5">
                    <h1 className="text-xl font-semibold text-zinc-900">
                        All Companies
                    </h1>
                    <AddCompanyButton />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[40rem] border-collapse text-left">
                        <thead>
                            <tr className="border-y border-zinc-200">
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Address
                                </th>
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Rate
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-normal text-zinc-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-10 text-center text-sm text-zinc-500"
                                    >
                                        No companies yet. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <CompanyRow
                                        key={company.id}
                                        id={company.id}
                                        name={company.name}
                                        addressLine1={company.addressLine1}
                                        addressLine2={company.addressLine2}
                                        townCity={company.townCity}
                                        countyState={company.countyState}
                                        postcodeZip={company.postcodeZip}
                                        country={company.country}
                                        billingRate={company.billingRate.toFixed(
                                            2,
                                        )}
                                        userCount={company._count.users}
                                        ticketCount={company._count.tickets}
                                        timesheetCount={
                                            company._count.timesheets
                                        }
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

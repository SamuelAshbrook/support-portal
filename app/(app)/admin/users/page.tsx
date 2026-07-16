import prisma from "@/app/lib/prisma";
import { AddUserButton } from "./add-user-button";
import { UserRow } from "./user-row";

export default async function UsersPage() {
    const [companyOptions, users] = await Promise.all([
        prisma.company.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        }),
        prisma.user.findMany({
            orderBy: { name: "asc" },
            include: { company: true },
        }),
    ]);

    return (
        <div className="min-h-full bg-[#f3f4f6] p-6">
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 px-6 py-5">
                    <h1 className="text-xl font-semibold text-zinc-900">
                        All Users
                    </h1>
                    <AddUserButton companies={companyOptions} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[48rem] border-collapse text-left">
                        <thead>
                            <tr className="border-y border-zinc-200">
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-sm font-normal text-zinc-400">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-normal text-zinc-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-sm text-zinc-500"
                                    >
                                        No users yet. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        id={user.id}
                                        name={user.name ?? ""}
                                        email={user.email}
                                        telephone={user.telephone ?? ""}
                                        companyId={user.companyId}
                                        companyName={
                                            user.company?.name ?? null
                                        }
                                        companies={companyOptions}
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

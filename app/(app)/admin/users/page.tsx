import prisma from "@/app/lib/prisma";
import { createClientUser } from "./actions";

export default async function UsersPage() {
    const [companies, users] = await Promise.all([
        prisma.company.findMany({ orderBy: { name: "asc" } }),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: { company: true },
        }),
    ]);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Users</h1>

            <form action={createClientUser} className="grid max-w-md gap-2">
                <input name="name" placeholder="Name" required className="w-full rounded-md border border-zinc-300 p-2" />
                <input name="email" placeholder="Email" required className="w-full rounded-md border border-zinc-300 p-2" />
                <input name="password" type="password" placeholder="Temp Password" className="w-full rounded-md border border-zinc-300 p-2" />
                <select name="companyId" required className="w-full rounded-md border border-zinc-300 p-2">
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
                <button className="w-full rounded-md bg-blue-500 text-white p-2">
                    Create Client User
                </button>
            </form>

            <ul className="divide-y divide-zinc-200">
                {users.map((user) => (
                    <li key={user.id} className="flex justify-between items-center p-4">
                        <span>{user.name} - {user.email}</span>
                        <span className="text-sm">
                            {user.role} . {user.company?.name ?? "-"}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
import prisma from "@/app/lib/prisma";
import { CreateUserForm } from "./create-user-form";

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

            <CreateUserForm companies={companies} />

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
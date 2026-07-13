import prisma from "@/app/lib/prisma";
import { CreateUserForm } from "./create-user-form";
import { UserListItem } from "./user-list-item";

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
                    <UserListItem
                        key={user.id}
                        id={user.id}
                        name={user.name ?? ""}
                        email={user.email}
                        telephone={user.telephone ?? ""}
                        role={user.role}
                        companyId={user.companyId}
                        companyName={user.company?.name ?? null}
                        companies={companies}
                    />
                ))}
            </ul>
        </div>
    )
}
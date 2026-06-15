import prisma from "@/app/lib/prisma";

export default async function Home() {
  const companies = await prisma.company.count();
  return <div>Companies in DB: {companies}</div>;
}

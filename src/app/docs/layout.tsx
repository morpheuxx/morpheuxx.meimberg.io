import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DocsNav } from "./DocsNav";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/api/auth/signin?callbackUrl=/docs");

  return (
    <main className="docs-page">
      <div className="docs-shell">
        <DocsNav />

        <article className="docs-content">{children}</article>
      </div>
    </main>
  );
}

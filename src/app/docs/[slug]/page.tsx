import fs from "node:fs";
import path from "node:path";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ALLOWED = new Set(["schedule", "models"]);

export default async function DocSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!ALLOWED.has(slug)) return notFound();

  const filePath = path.join(process.cwd(), "data", "docs", `${slug}.md`);
  if (!fs.existsSync(filePath)) return notFound();

  const md = fs.readFileSync(filePath, "utf8");

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>;
}

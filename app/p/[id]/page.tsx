import { notFound } from "next/navigation";
import { getPaste, isPasteAvailable, incrementViewCount } from "@/lib/kv";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPastePage({ params }: PageProps) {
  const { id } = await params;
  const headersList = await headers();
  const testNowMs = headersList.get("x-test-now-ms");

  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  // Check if paste is available
  if (!isPasteAvailable(paste, testNowMs)) {
    notFound();
  }

  // Increment view count
  await incrementViewCount(id);

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const escapedContent = escapeHtml(paste.content);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">Paste</h1>
            <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground bg-muted p-4 rounded border border-border overflow-x-auto">
              {escapedContent}
            </pre>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <a
              href="/"
              className="text-primary hover:underline text-sm"
            >
              ← Create a new paste
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

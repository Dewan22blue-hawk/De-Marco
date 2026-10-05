import { listContents } from "./actions"
import { PlusCircle, Search, FileText } from "lucide-react"
import Link from "next/link"
import { SearchBar } from "@/components/layout/search-bar"
import { AutoGenerateForm } from "./auto-generate-form"
import { ContentActions } from "./content-actions"

export const metadata = {
  title: "Content Library | De-Marco Studio",
}

export default async function ContentsPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const { data: contents, count } = await listContents({
    search: query,
    limit,
    offset
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Content Library</h1>
          <p className="text-on-surface-variant mt-1">Manage marketing copies, posts, and articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contents/new" className="bg-surface-container hover:bg-surface-container-high px-4 py-2 rounded-lg font-medium text-on-surface flex items-center gap-2 transition-colors border border-outline-variant/30">
            <PlusCircle className="w-4 h-4" />
            New Content
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 clay-surface justify-between">
        <SearchBar placeholder="Search contents..." />
        <AutoGenerateForm />
      </div>

      {contents && contents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map(content => (
            <Link href={`/dashboard/contents/${content.id}`} key={content.id} className="clay-card rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300 block">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-on-surface line-clamp-1">{content.title}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                  {content.status}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant line-clamp-3 bg-surface-container-lowest p-3 rounded-lg font-mono text-xs">
                {content.body || "No content body."}
              </p>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-outline-variant/30" onClick={(e) => e.stopPropagation()}>
                <div className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  {content.content_type} • {content.platform || "No platform"}
                </div>
                <ContentActions contentId={content.id} status={content.status || "draft"} defaultPlatform={content.platform || "instagram"} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No contents found</h3>
          <p className="text-on-surface-variant max-w-md mx-auto mb-6">
            Generate new content using AI or create one manually to build your library.
          </p>
        </div>
      )}
    </div>
  )
}

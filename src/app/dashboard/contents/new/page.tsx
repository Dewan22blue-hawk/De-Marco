import { Suspense } from "react"
import { CreateContentForm } from "./create-content-form"

export const metadata = {
  title: "New Content | De-Marco Studio",
}

export default function NewContentPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Create Content</h1>
        <p className="text-on-surface-variant mt-1">Draft a new piece of content for your library.</p>
      </div>

      <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30">
        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading form...</div>}>
          <CreateContentForm />
        </Suspense>
      </div>
    </div>
  )
}

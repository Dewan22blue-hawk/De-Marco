import { listTemplates } from "@/app/dashboard/templates/actions"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("q") || undefined
  const category_id = searchParams.get("category") || undefined
  const template_type = searchParams.get("type") || undefined
  const limit = Number(searchParams.get("limit")) || 50
  const offset = Number(searchParams.get("offset")) || 0

  try {
    const result = await listTemplates({ search, category_id, template_type, limit, offset })
    return Response.json({ data: result.data, count: result.count })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
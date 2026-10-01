import { listAssetCategories } from "@/app/dashboard/assets/actions"

export async function GET() {
  try {
    const categories = await listAssetCategories()
    return Response.json({ data: categories })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
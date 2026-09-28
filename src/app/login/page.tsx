import { login } from "./actions"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;
  
  return (
    <div className="flex bg-neutral-100 min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col space-y-2 text-center pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Welcome to Deraly
          </h1>
          <p className="text-sm text-neutral-500">
            Sign in to your account to continue
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4" action={login}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" placeholder="name@deraly.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button className="w-full mt-6" type="submit" variant="default">
            Simpan & Masuk
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          Not registered yet?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  )
}

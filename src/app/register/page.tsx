import { signup } from "./actions"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function RegisterPage({
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
            Create an Account
          </h1>
          <p className="text-sm text-neutral-500">
            Join Deraly Marketing Platform
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4" action={signup}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="full_name">Full Name</label>
            <Input id="full_name" name="full_name" type="text" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" placeholder="name@deraly.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <Button className="w-full mt-6" type="submit" variant="default">
            Daftar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </div>
      </Card>
    </div>
  )
}

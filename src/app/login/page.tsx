import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-darker flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red opacity-[0.03] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 opacity-[0.02] blur-3xl rounded-full pointer-events-none" />
      
      <div className="text-center mb-8 z-10">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 shadow-xl">
            <ShieldAlert className="h-8 w-8 text-brand-red animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Emergency Command Center</h1>
        <p className="text-gray-400">SafeSphere Secure Access Gateway</p>
      </div>

      <Card className="w-full max-w-md z-10 border-gray-800 bg-brand-dark/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your credentials to access the command dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-200">
              Email or ID Number
            </label>
            <input
              id="email"
              type="email"
              placeholder="operator@safesphere.local"
              className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                Password
              </label>
              <Link href="#" className="text-xs text-brand-red hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-200">
              Select Role (Simulation)
            </label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
            >
              <option value="admin">Global Administrator</option>
              <option value="reception">Front Desk / Reception</option>
              <option value="security">Security Team Lead</option>
              <option value="medical">Medical Responder</option>
              <option value="fire">Fire & Maintenance</option>
            </select>
          </div>
          
          <div className="space-y-2 pt-2">
            <label htmlFor="building" className="text-sm font-medium text-gray-200">
              Building Selection
            </label>
            <select
              id="building"
              className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
            >
              <option value="hq">Headquarters (Sector 1)</option>
              <option value="b2">Warehouse B2</option>
              <option value="north">North Campus</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/dashboard" className="w-full">
            <Button variant="destructive" className="w-full bg-brand-red hover:bg-red-600 shadow-lg shadow-red-900/20">
              Authenticate & Enter
            </Button>
          </Link>
          <div className="flex items-center space-x-2 w-full justify-center">
            <input
              type="checkbox"
              id="otp"
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-brand-red focus:ring-brand-red focus:ring-offset-gray-900"
            />
            <label
              htmlFor="otp"
              className="text-sm font-medium leading-none focus:outline-none text-gray-400"
            >
              Use OTP Login instead
            </label>
          </div>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-6 text-xs text-gray-600 flex gap-4 z-10">
        <span>EN | ES | FR</span>
        <span>•</span>
        <span>System Status: Optimal</span>
      </div>
    </div>
  )
}

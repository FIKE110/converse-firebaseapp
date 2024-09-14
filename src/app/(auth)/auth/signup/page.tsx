'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label} from '@/app/components/ui/label'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Mail } from "lucide-react"
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { doc, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router=useRouter()
  const googleProvider=new GoogleAuthProvider()

  const handleSubmit = async (e: React.FormEvent) => {
    const submitPromise=new Promise(async (resolve,reject)=>{
      try{
      e.preventDefault()
    console.log('Signup attempt with:', { email, password })
    const cred=await createUserWithEmailAndPassword(auth,email,password)
    const user = cred.user;
    console.log(user)

    // Store the user data including username in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      createdAt: new Date(),
    });
      router.push('/auth/login')
      resolve(user)
  }
catch(e:any){
  console.log(e)
  toast.error(e.message)
  reject(e.message)
}
})
    toast.promise(submitPromise,{
      loading:<h1>Registering User</h1>,
      success:<h1>User is successul registered</h1>,
      error:<h1>error occurred</h1>
    })
    
  }


  const handleGoogleSignup = async () => {
    // Placeholder for Google signup logic
    console.log('Google signup initiated')
    const cred=await signInWithPopup(auth,googleProvider)
    const user=cred.user
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      createdAt: new Date(),
    });
    router.push('/chats')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up for Converse</CardTitle>
          <CardDescription className="text-center">Create your account to start conversing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignup}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" aria-hidden="true">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
              </svg>
              Google
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Sign up with Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account? <a href="/auth/login" className="text-blue-600 hover:underline">Log in</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
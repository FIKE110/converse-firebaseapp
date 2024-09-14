'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import useAuth from '@/lib/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SimpleUsernameForm() {
  const [username, setUsername] = useState('')
  const {user}=useAuth()
  const router=useRouter()

  async function updateUsername(userId:string, newUsername:string) {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        username: newUsername,
      });
      router.push("/chats")
      console.log('Username updated.');
    } catch (error) {
        toast.error("Error updating username")
      console.error('Error updating username:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("ckkd")
    if (username.trim() && user) {
      // Here you would typically send the data to your backend
      console.log('Submitted username:', username)
    //   toast({
    //     title: "Username submitted",
    //     description: `You submitted the username: ${username}`,
    //   })
    updateUsername(user.uid,username)
     // Clear the input after submission
    } else {
    //   toast({
    //     title: "Error",
    //     description: "Please enter a username",
    //     variant: "destructive",
    //   })
    }
  }

  return (
    <div className='flex items-center justify-center h-dvh p-10'>
        <div className="w-full max-w-md text-primary mt-10 p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Submit Username</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <Button type="submit" className="w-full">
          Submit Username
        </Button>
      </form>
    </div>
    </div>
  )
}
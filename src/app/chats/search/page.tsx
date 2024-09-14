'use client'
import { SetStateAction, useEffect, useState } from 'react'
import { Search, Lock, ArrowLeft } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { motion } from "framer-motion"
import { useMutation } from '@tanstack/react-query'
import { arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import useAuth from '@/lib/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'


export default function RoomSelector() {
  const [searchTerm, setSearchTerm] = useState('')
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(true)
  const router=useRouter()
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const mutation=useMutation({
    mutationKey:['getAllRoomKey'],
    mutationFn:getAllRooms
  })

  const {user,username}=useAuth()


  async function addMemberToGroup (roomId:string, newMemberId:string) {
    try {
      const groupRef = doc(db, 'rooms', roomId);
  
      // Add the new member to the members array
      await updateDoc(groupRef, {
        members: arrayUnion(newMemberId), // Ensure the member is only added once,
        membersName:arrayUnion(username)
      } as any,{});
  
      console.log('Member added to group.');
      toast.success('successfully added to group')
      router.replace(`/chats`)
    } catch (error) {
      console.error('Error adding member to group:', error);
    }
  };

  async function getAllRooms(searchTerm:string){
    try {
      // Reference the 'rooms' collection
      const roomsRef = collection(db, 'rooms');
  
      // Fetch all documents (rooms) in the collection
      const q = searchTerm ? query(roomsRef, 
        where('name', '>=', searchTerm),
        where('name', '<', searchTerm + '\uf8ff')
      ) : query(roomsRef
      );
      const querySnapshot = await getDocs(q);
  
      // Extract room data
      const rooms = querySnapshot.docs.map(doc => ({
        id: doc.id,        // Room document ID
        ...doc.data(),     // All other room fields
      }));
  
      console.log('All rooms:', rooms);
      return rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleRoomSelect = (room:any) => {
    if (!room.public) {
      setSelectedRoom(room)
      setPasscodeModalOpen(true)
    } else {
      // Handle room selection (e.g., navigate to room page or show details)
      console.log(`Selected room: ${room.name}`)
      addMemberToGroup(room.id,user?.uid as string)
    }
  }

  const handlePasscodeSubmit = () => {
    // Here you would typically validate the passcode
    if(selectedRoom && selectedRoom.passcode===passcode){
      addMemberToGroup(selectedRoom.id,user?.uid as string)
    }
    setPasscodeModalOpen(false)
    setPasscode('')
  }
  useEffect(()=>{
    mutation.mutate('')
  },[])
  //console.logmutation.mutate("f"))

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex flex-row items-center justify-between mb-6">
        <Button variant="ghost" className="p-2" onClick={() => router.replace('/chats')}>
          <ArrowLeft className="h-6 w-6 mr-2" />
          Back
        </Button>
        <h1 className="text-xl md:text-3xl font-bold">Available Rooms</h1>
      </header>
      <div className="relative mb-6 text-white">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search rooms..."
          onChange={(e) => mutation.mutate(e.target.value)}
          className="pl-10 py-6 text-lg text-white"
        />
      </div>
      {mutation.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-32 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {mutation?.data && mutation.data.map((room:any) => (
            <motion.div key={room.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleRoomSelect(room)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {room.name}
                    {!room.public && <Lock className="h-4 w-4 text-yellow-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Created by {room.creatorName}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      <Dialog open={passcodeModalOpen} onOpenChange={setPasscodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-black'>Enter Passcode for {selectedRoom?.name}</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="mt-2 text-black bg-white"
          />
          <DialogFooter>
            <Button onClick={handlePasscodeSubmit} className="w-full mt-4">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {v4 as uuid} from 'uuid'
import {useDropzone} from 'react-dropzone'
import { PlusCircle, Send, MoreVertical, Users, Key, LogOut, Paperclip, X, ArrowLeft, SearchIcon, LockKeyholeOpen, LockKeyholeIcon, MicOff, Mic } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { arrayRemove, collection, doc, getDoc,  onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { useMutation, useQuery } from '@tanstack/react-query'
import useAuth from '@/lib/auth'
import formatTimestampToTime from '@/lib/custometime'
import { useRouter } from 'next/navigation'
import Modal from '../components/ui/modal'
import MembersModal from '../components/ui/membermodal'
import toast from 'react-hot-toast'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import Image from 'next/image'
import getFileCategory from '@/lib/filetype'
import { getFileIcon } from '../components/FileIcon'


type Message = {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

type CreateRoomType={
    name:string;
    passcode:string;
    messages?: string[];
    members?:string[];
    createAt?:string;
    updatedAt?:string;
    creatorName?:string
}



//createRoom({name:"fortune",passcode:"1222323",messages:['sjdjsd'],members:['djdjd']})

export default function ChatPage() {
    
    const {data,refetch}=useQuery<any[]>({queryKey:["rooms"],queryFn:()=>getRooms()})
    const mutation=useMutation({mutationKey:['roomsmute'],mutationFn:createNewRoom})
    const mutationRoomChats=useMutation({mutationKey:['roomschats'],mutationFn:getRoomChats})
    const router=useRouter()
    const {user,loading,username}=useAuth()
    const scrollRef=useRef<any>(null)
    const [speed, setSpeed] = useState<number | string>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

    if(user && !loading && !username){
      router.replace("/profile/setup")
    }
    

    async function getRooms():Promise<any>{
        return new Promise((resolve,reject)=>{
            const roomRef=collection(db,'rooms')
            const q=query(roomRef,where('members','array-contains',user.uid))
            onSnapshot(q,(snapshot)=>{
                const rooms=snapshot.docs.map((doc)=>doc.data());
                console.log(rooms)
                resolve(rooms)
            },(error)=>{
                reject(error)
            })
    
        })
    }
    

    async function createNewRoom({name,passcode,members=[]}:CreateRoomType){
        if(!user) return []

        const roomId=uuid()
        const roomRef=collection(db,'rooms')
        members.push(user.uid)

        console.log(name,passcode)
        
            return setDoc(doc(roomRef,roomId),{
                id:roomId,
                name:name,
                passcode:passcode,
                members:members,
                membersName:[username],
                public:true,
                creatorName:user.displayName
            })
    }


   if(mutation.isSuccess){
    refetch()
   }
  const [rooms, setRooms] = useState<any[]>([])

  const [selectedRoom, setSelectedRoom] = useState<string | null>()
  const [messages, setMessages] = useState<[]>([
    // { id: '1', sender: 'Alice', content: 'Hey there!', timestamp: '10:00 AM' },
    // { id: '2', sender: 'Bob', content: 'How\'s it going?', timestamp: '10:05 AM' },
    // { id: '3', sender: 'Alice', content: 'Pretty good, thanks!', timestamp: '10:10 AM' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomPasscode, setNewRoomPasscode] = useState('')
  const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen,setIsOpen]=useState(false)
  const [modalOpen,setModalOpen]=useState(false)
  const [membersList,setMembersList]=useState([])

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    noClick:true,
    noKeyboard:true,
    onDrop: (acceptedFiles) => {
      if (fileInputRef.current && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        setAttachments([file])
      }
    },
  });



  useEffect(()=>{
    console.log("scroll")
    if(scrollRef && scrollRef.current){
    scrollRef.current.scrollIntoView({behavior:'smooth'})
  }
  },[messages.length])
  useEffect(() => {
    if (!selectedRoom) return;

    
    // Reference to the messages collection within the room
    const messagesRef = collection(db, 'rooms', selectedRoom, 'messages');
    
    // Query to order messages by timestamp
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    let unsubscribe=null
    try{

    // Listen to real-time updates using onSnapshot
     unsubscribe = onSnapshot(q, (snapshot) => {
    
      const updatedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(updatedMessages as any)
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      console.log(updatedMessages)

   
    });

  }
  catch(e){
    toast.error("Could not access Conversation")
  }

    // Cleanup the listener on unmount
    return () =>{if(unsubscribe) unsubscribe()};
  
  }, [selectedRoom]);

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };


  const startRecording = async () => {
    if(!selectedRoom) return 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      const recordingVn=new Promise((resolve,reject)=>{
        mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        handleSendMessage(null,audioBlob,true)
        resolve("vn stopped")
      }}
    )

    toast.promise(recordingVn,{
      error:<h1>Could not record vn</h1>,
      loading:<h1>Voice note is being made</h1>,
      success:<h1>Sucessfully made voice note</h1>
    })

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };


  function uploadFile(file:File | Blob | any,vn:boolean){
    if(!file) return 
    return new Promise((resolve,reject)=>{
      const fileId=uuid()
    const storageRef=
    vn ? ref(storage, `voice_notes/${Date.now()}.webm`) : ref(storage,`${file.type ? file.type.split('/')[0] : 'others'}/${fileId}_${file.name}`)
    const uploadTask=uploadBytesResumable(storageRef,file)
    setIsUploading(true);

    let previousTime = Date.now();
    let previousBytesTransferred = 0;
    uploadTask.on('state_changed',(snapshot)=>{
      const currentTime = Date.now();
        const bytesTransferred = snapshot.bytesTransferred;
        const totalBytes = snapshot.totalBytes;
        const elapsedTime = (currentTime - previousTime) / 1000; // Time in seconds
        const bytesUploadedSinceLast = bytesTransferred - previousBytesTransferred;

        // Calculate the upload speed (in KB/s)
        const uploadSpeed = (bytesUploadedSinceLast / 1024) / elapsedTime;

        setProgress((bytesTransferred / totalBytes) * 100);
        setSpeed(uploadSpeed.toFixed(2)); // Display upload speed rounded to 2 decimal places

        previousTime = currentTime;
        previousBytesTransferred = bytesTransferred;
      console.log(snapshot.bytesTransferred)
    },(error)=>{
      console.log(error)
      setIsUploading(false);
      reject(error.message)
    },
    ()=>{
      setIsUploading(false);
        getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>{
        resolve(downloadUrl)
      })
    }
  )
    })
  }


  async function getRoomChats(roomId:string | null){
    console.log(roomId)
    if(!roomId){throw new Error('no room')}
    return new Promise((resolve,reject)=>{
        const roomRef=collection(db,'rooms',`${selectedRoom}`,'messages')
        const q=query(roomRef,orderBy('timestamp','asc'))
        onSnapshot(q,(snapshot)=>{
            const messages=snapshot.docs.map((doc)=>doc.data());
            console.log(messages)
            resolve(messages)
        },(error)=>{
            reject(error)
        })

    })
    
  }


  async function roomPrivacy(isPublic:boolean,roomId:string){
    console.log("making private",isPublic)
    await updateDoc(doc(db,'rooms',roomId),{
      public:isPublic
    })

    refetch()

    toast.success(`Group has been made ${isPublic ? 'public' : 'private'}`)
  }

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId)
    mutationRoomChats.mutate(roomId)
  }

  const handleSendMessage = async (e: React.FormEvent,VN ,vn=false) => {
    e?.preventDefault()
   
    const messageId=uuid()
    if ((newMessage.trim() || attachments.length > 0  || vn) && selectedRoom) {
      const downloadUrl=!vn ? uploadFile(attachments[0],false) : uploadFile(VN,true)
      if(attachments[0] || vn){
      toast.promise(downloadUrl,{
        loading:<h1>Uploading attachment</h1>,
        success:<h1>Successfully uploaded attachment</h1>,
        error:<h1>Could not upload attachment</h1>
      })
    }
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'You', // In a real app, this would be the current user's name
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }


      setMessages([...messages, newMsg] as any)
      setNewMessage('')
      setAttachments([])

      if(username===""){
        router.replace("/profile/setup")
      }

      const messageType=getFileCategory(vn ? 'audio/webm' : attachments[0] ? attachments[0].type : 'message')

      await setDoc(doc(db,'rooms',selectedRoom,'messages',messageId),{
        id:messageId,
        sender:user?.uid,
        senderName:username || '',
        message:newMessage,
        messageType:await downloadUrl ? messageType : 'message',
        attachmentLink:await downloadUrl ? await downloadUrl : '', 
        timestamp:serverTimestamp() 
      })

      mutationRoomChats.mutate(selectedRoom)
      // Here you would typically send the message and upload attachments to your backend
    }
  }



  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (newRoomName.trim() && newRoomPasscode.trim()) {
      const newRoom: any = {
        id: Date.now().toString(),
        name: newRoomName,
        lastMessage: 'Room created'
      }
      setRooms([...rooms, newRoom])
      setNewRoomName('')
      setNewRoomPasscode('')
      setIsNewRoomDialogOpen(false)
      // Here you would typically send the new room data to your backend
    }
  }

  const handleLeaveRoom = () => {
    // Implement leave room logic here
    if(selectedRoom){
      removeMemberFromRoom(selectedRoom)
    }
    console.log('Leaving room:', selectedRoom)
    setSelectedRoom(null)
  }

  const handleCopyLink = () => {
    // Implement copy link logic here
    console.log('Copying link for room:', selectedRoom)
  }

  const handleShowPasscode = () => {
    setIsOpen(true)
    console.log('Showing passcode for room:', selectedRoom)
  }

  const getMembersInRoom = async (roomId:string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnapshot = await getDoc(roomRef);
  
    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.data();
      console.log(roomData.membersName)
      return roomData.membersName; // Assuming 'members' is an array of member IDs
    } else {
      console.log('Room not found');
      return [];
    }
  };



  const getRoomUsernames = async (roomId:string) => {
    const memberIds = await getMembersInRoom(roomId);
  
    if (memberIds.length > 0) {
      console.log('Usernames:', memberIds);
      return memberIds;
    } else {
      console.log('No members in the room');
      return [];
    }
  };
  
  const removeMemberFromRoom = async (roomId:string) => {
    const roomRef = doc(db, 'rooms', roomId);
  
    // Update the document to remove the memberId from the 'members' array
    await updateDoc(roomRef, {
      members: arrayRemove(user?.uid),
      membersName:arrayRemove(username)
    });

    refetch()
    setMessages([])
    console.log('Member removed successfully!');
  };
  

  const handleShowMembers = async () => {
    // Implement show members logic here
    if(selectedRoom){
      setMembersList(await getRoomUsernames(selectedRoom));
      setModalOpen(true)
    }
    console.log('Showing members for room:', selectedRoom)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([e.target.files[0]])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {/* Sidebar / Room List */}
      <div className={`w-full md:w-64 bg-white border-r border-gray-200 flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-primary text-primary-foreground">
         <div className='flex w-full justify-between items-center mb-4'>
         <h2 className="text-xl font-bold">Rooms</h2>
         <SearchIcon size={20} onClick={()=>router.push("/chats/search")}/>
          </div>
          <div className='flex flex-row gap-5 md:flex-col'>
          <Dialog open={isNewRoomDialogOpen} onOpenChange={setIsNewRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className='text-black'>
                <DialogTitle className='text-black'>Create New Room</DialogTitle>
                <DialogDescription>
                  Enter a name and passcode for your new room.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRoom}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-left text-black">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="passcode" className="text-left text-black">
                      Passcode
                    </Label>
                    <Input
                      id="passcode"
                      type="password"
                      value={newRoomPasscode}
                      onChange={(e) => setNewRoomPasscode(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={()=>{mutation.mutate({name:newRoomName,
                    passcode:newRoomPasscode
                  })
                setIsNewRoomDialogOpen(false)
                setNewRoomName('')
                setNewRoomPasscode('')
                }}
                  >Create Room</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
              Search for room
              </Button>
            </DialogTrigger>
          </Dialog> */}
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {data && data.map((room) => (
            <div
              key={room.id}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedRoom === room.id ? 'bg-gray-300 text-secondary-foreground' : 'text-gray-700'}`}
              onClick={() => {handleRoomSelect(room.id)

                console.log(room.id)
              }}
            >
              <h3 className="font-semibold">{room.name}</h3>
              <p className="text-sm text-gray-500 truncate">{room.lastMessage || "New Group"}</p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div   {...getRootProps({ className: 'dropzone' })} className={`flex-grow overflow-hidden flex flex-col ${selectedRoom ? 'flex' : 'hidden md:flex'}`}>
        <div className="bg-primary w-full text-primary-foreground p-4 shadow flex justify-between items-center">
          {selectedRoom && (
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedRoom(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl font-bold">
            {selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name : 'Select a room'}
          </h1>
          {selectedRoom && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Room Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleShowPasscode}>
                  <Key className="mr-2 h-4 w-4" />
                  Show Passcode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShowMembers}>
                  <Users className="mr-2 h-4 w-4" />
                  Members List
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={()=>data && roomPrivacy(!(data.filter(room=>room.id===selectedRoom)[0].public),selectedRoom)}>
                 {data && !data.filter(room=>room.id===selectedRoom)[0].public ? <><LockKeyholeOpen className="mr-2 h-4 w-4" />
                  Make Public</>
                  :
                  <><LockKeyholeIcon className="mr-2 h-4 w-4" />
                  Make Private</>
                  }
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLeaveRoom}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <ScrollArea className="md:flex-grow p-4 h-full bg-white ">
          {user && messages &&  messages.map((message:any,index) => (
            <div  key={message.id} className={`mb-4 ${message.sender === user?.uid ? 'text-right' : ''}`}>
              <div className={`inline-block p-4 rounded-lg ${message.sender === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                <p className="font-semibold text-xs pb-2">{message.sender===user.uid? 'You' : message.senderName}</p>
                <p className='pb-2'>{message.message}</p>
                {message.attachmentLink && (
                  <div className="mt-2">
                    {message.messageType==='image'? <img src={`${message.attachmentLink}`} className='w-[100%] max-h-[900px] h-auto'/>
                    // {/* {message.attachments.map((attachment, index) => (
                    //   <div key={index} className="text-sm">
                    //     <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    //       {attachment.name}
                    //     </a>
                    //   </div>
                    // ))} */}
                     :
                     <>{message.messageType==='video'  ? 
                      <video src={`${message.attachmentLink}`} className='max-h-[900px] h-auto' controls/>
                      :
                      <>{message.messageType==='audio' 
                        ? 
                         <audio src={`${message.attachmentLink}`} controls />
                        :
                     <>
                      <div className="flex-shrink-0 flex justify-end">
                  {getFileIcon(message.messageType)}
                </div>
              <div>
            <p className="text-gray-700 font-medium">{decodeURIComponent(message.attachmentLink.split("?")[0].split("_")[message.attachmentLink.split("?")[0].split("_").length-1])}</p>
              <div className="mt-2 flex items-center space-x-2">
            <span className="text-sm text-gray-500"></span>
            <a href={`${message.attachmentLink}`} target='_blank' className="text-blue-500 text-sm hover:underline">Open attachment</a>
            </div>
              </div>
                     </>}
                     </>}
                    </>}
                  </div>
                )}
                <p ref={index===messages.length-1 ? scrollRef : null} className="text-xs opacity-75 mt-1">{formatTimestampToTime(message.timestamp)}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="bg-gray-100 p-4 border-t border-gray-200 md:static bottom-0 w-full">
          <form onSubmit={handleSendMessage as any} className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow bg-white text-gray-800"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4 stroke-black" />
              </Button>
              {newMessage.trim().length>0 || attachments.length>0 ? 
              <Button type="submit" variant="secondary">
                <Send className="h-4 w-4" />
              </Button>
              :
              <Button
              type="button" className={isRecording ? "bg-red-500" : `bg-black`} 
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? <MicOff /> : <Mic />}
        </Button>}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="bg-white rounded-full px-3 py-1 text-sm flex items-center">
                    <span className="truncate max-w-xs text-primary">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="ml-2 text-primary hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>  
          {isUploading && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-blue-600 h-6 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-2">
            Upload Progress: {Math.round(progress)}%
          </p>
          <p className="text-gray-600">
            Speed: {speed} KB/s
          </p>
        </div>
      )}
        </div>
      </div>
      <MembersModal
        members={membersList as any}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <Modal isOpen={isOpen} closeModal={() => setIsOpen(false)} heading={`Rooms's Passcode`} title={data && data.length>0 && data.filter(room=>room.id==selectedRoom)[0]?.passcode}/>
    </div>
  )
}
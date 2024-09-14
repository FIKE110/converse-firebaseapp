'use client'
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function useAuth(){
    const [user,setUser]=useState<User | null>(null)
    const [loading,setLoading]=useState(true)
    const [username,setUsername]=useState('')

    useEffect(()=>{

        const unsubscribe=onAuthStateChanged(auth,currentUser=>{
            if(currentUser){
                getDoc(doc(db,'users',currentUser.uid))
                .then(snapshot=>{
                    if(snapshot.exists()){
                        setUsername(snapshot.data().username)
                        setUser(currentUser)
                        setLoading(false)
                    }
                })
            }
        })

        return ()=>unsubscribe()

    },[])

    return {user,loading,username}
}
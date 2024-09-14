import * as firebaseui from 'firebaseui';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import 'firebaseui/dist/firebaseui.css'

export default function FirebaseAuthUI() {
    const uiRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
        const uiConfig = {
            signInSuccessUrl: '/chats',
            signInOptions: [
                firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
            ],
        };

        if (uiRef.current) {
            ui.start(uiRef.current, uiConfig);
            console.log(uiRef)
        }

        return () => {
          //  ui.delete();
        };
    },[uiRef]);

    return <div ref={uiRef}>Hello world</div>;
}

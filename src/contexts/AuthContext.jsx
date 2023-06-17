import { createContext, useContext, useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword} from 'firebase/auth'
import { auth, db } from '../firebase'
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot } from 'firebase/firestore';

const UserContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState({});
    const [admin, setAdmin] = useState(false);
    const signInUser = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
    };
    const registerUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    const logout = () => {
        return signOut(auth);
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(currentUser);
            setUser(currentUser);
        });
        

        return unsubscribe
    }, []);

    return (
        <UserContext.Provider value={{signInUser, logout, user, admin}}>
            {children}
        </UserContext.Provider>
    );
}

export const UserAuth = () => {
    return useContext(UserContext);
}


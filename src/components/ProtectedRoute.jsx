import React from 'react'
import {Navigate} from 'react-router-dom'
import { UserAuth } from '../contexts/AuthContext'


export default function ProtectedRoute({children}) {
    const {user} = UserAuth();

    //redirect the user if they're not signed in
    if(!user){
        return <Navigate to="/" />
    }
    return children;
}

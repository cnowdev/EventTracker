import React from 'react'
import { Box, TextField, Button, Typography, Select, InputLabel, MenuItem } from '@mui/material'
import { Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { UserAuth } from '../contexts/AuthContext';
import dayjs, {Dayjs} from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { db } from '../firebase';
import { doc, setDoc, addDoc, collection, query, where, getDocs, getDoc, runTransaction, writeBatch, increment } from "firebase/firestore"; 
import { DataGrid } from '@mui/x-data-grid';
import { Navigate } from 'react-router-dom';


export default function EventValidator() {
    const [eventSignupList, setEventSignupList] = useState([]);
    const [selectedIDs, setSelectedIDs] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [currentUserDoc, setCurrentUserDoc] = useState(null);
    const {user} = UserAuth();

  //get all event signups from firestore
    const getEventSignups = async () => {
        const q = query(collection(db, 'eventsignups'), where("verified", "==", false));
        const eventSignups = await getDocs(q);
        return eventSignups.docs
    }

    //get all user and event data from each event signup
    const getEventSignupData = () => {
        getEventSignups().then(async (eventSignups) => {
            await Promise.all(eventSignups.map(async (eventSignup) => {
                const userDoc = await getDoc(eventSignup.data().user);
                const eventDoc = await getDoc(eventSignup.data().event);
    
                const obj = {
                    id: eventSignup.id,
                    user: userDoc.data(),
                    userID: userDoc.id,
                    event: eventDoc.data()
                }
    
    
                setEventSignupList((prev) => [...prev, obj]);
            }));
        })
    }

    //validate event when checked
    const eventValidate = async (eventSignupID, userID, points) => {

        //validate the user's admin status
        if(currentUserDoc && !currentUserDoc.data().admin) {
            setError('You are not an admin!');
            return;
        }

        try{
            //create a write batch so we can validate multipule users at once
            const batch = writeBatch(db);
            console.log(eventSignupID, userID, points);
            //update user points
            const userRef = doc(db, 'users', userID);
            batch.update(userRef, {"points": increment(points)});

            //update event signup
            const eventSignupRef = doc(db, 'eventsignups', eventSignupID);
            batch.update(eventSignupRef, {"verified": true});

            await batch.commit();

            setSuccess('Event validated successfully!');
        }catch(e){
            console.log(e.message);
            setError(e.message);
        }
    }

//on page render, get event signup data
let initialized = false;
useEffect(() => {
    if(!initialized) {
        initialized = true;
        getEventSignupData();
    }

}, []);



//get current user when the user object is defined
React.useEffect(() => {
    if(user.uid){
      const fetchUserDoc = async() => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setCurrentUserDoc(userDoc);
      }
      
      fetchUserDoc();
      console.log(currentUserDoc);
    }

  }, [user]);

//Map every eventsignup to a row in the data grid
const rows = eventSignupList.map((eventSignup) => {
    return {
        id: eventSignup.id,
        col1: eventSignup.user.name,
        col2: eventSignup.event.name,
        col3: eventSignup.event.pointsEarned
    }
});

  return (
    <div>
      {(currentUserDoc && !currentUserDoc.data().admin)? <Navigate to='/' />: null}
    <DataGrid
  checkboxSelection
  sx={{
    width: '50%',
    margin: 'auto',
    backgroundColor : '#ffffff',
  }}
  rows={rows}
  columns={ [{field: 'col1', headerClassName: 'columncolor', headerName: 'User Name', width: 300}, {field: 'col2', headerClassName: 'columncolor', headerName: 'Event Name', width: 200}, {field: 'col3', headerClassName: 'columncolor', headerName: 'Points', width: 25}]}
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 20 },
    },
  }}
  onRowSelectionModelChange={(ids) => {
    setSelectedIDs(ids);
}
  }

/> 

<Button variant="contained" 
sx={{margin: 'auto', display: 'block', marginTop: '20px', marginBottom: '20px', color: 'white', width: '50%'}}
onClick={() => {
    console.log(eventSignupList);
    if(selectedIDs.length === 0){
        setError('Please select at least one user to validate');
        return;
    }
    selectedIDs.forEach((id) => {
        const signupInfo = eventSignupList.find((eventSignup) => eventSignup.id === id);
        const eventPoints = signupInfo.event.pointsEarned
        eventValidate(id, signupInfo.userID, eventPoints);
             
    });
}}>Validate Selected User(s)</Button>

{error?
              <Alert 
              variant='filled'
              severity='error'
              sx={{mt:2}}
              >{error}</Alert> : null
              } 

              {success?
              <Alert 
              variant='filled'
              severity='success'
              sx={{mt:2}}
              >{success}</Alert> : null
              } 
              
    </div>
  )
    }

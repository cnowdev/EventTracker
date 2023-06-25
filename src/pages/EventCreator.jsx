import React from 'react'
import { Box, TextField, Button, Typography, Select, InputLabel, MenuItem } from '@mui/material'
import { Alert } from '@mui/material';
import { useState } from 'react';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { UserAuth } from '../contexts/AuthContext';
import dayjs, {Dayjs} from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { db } from '../firebase';
import { doc, setDoc, addDoc, collection, getDoc } from "firebase/firestore"; 
import {Navigate} from 'react-router-dom'




export default function EventCreator() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //this is needed for verifying if the user is an admin (and for the 'creator' field)
    const {user} = UserAuth();
    const [currentUserDoc, setCurrentUserDoc] = useState(null);
    
    //form fields
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [pointsEarned, setPointsEarned] = useState('');
    const [time, setTime] = useState(dayjs());
    const [type, setType] = useState('');



    //get user admin status
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





    //add event to firestore
    const addEvent = async () => {
      //const userDoc = await getDoc(currentUserRef);
      const userData = currentUserDoc.data();
      const isAdmin = userData.admin;

      if(!isAdmin) {
        setError('You are not an admin!');
        return;
      }
      try{
      await addDoc(collection(db, "events"), {
        creator: doc(db, 'users', currentUserDoc.id),
        description: description,
        name: name,
        pointsEarned: pointsEarned,
        time: new Date(time),
        type: type
      });
      setSuccess('Event created successfully!');
    } catch(e){
      console.log(e.message);
      setError(e.message);
    }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        if(!name || !description || !pointsEarned || !type){
          setError('Invalid or empty input(s). Please try again.');
          return;
    } else{
      setError('');
      setSuccess('');
      addEvent();

      
    }
  }


  return (
    <div>
      {(currentUserDoc && !currentUserDoc.data().admin)? <Navigate to='/' />: null}
    <Typography component="h1" variant="h5">
        Create an Event
    </Typography>
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
                error={!name}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Event Name"
                name="name"
                autoFocus
                onChange={(e) => 
                  setName(e.target.value)
                }
              />
            <TextField
                error={!description}
                margin="normal"
                required
                fullWidth
                id="description"
                label="Event Description"
                name="description"
                autoFocus
                multiline
                rows={4}
                onChange={(e) => 
                  setDescription(e.target.value)
                }
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Event Time"
              value={time}
              onChange={(e) => setTime(e)}
              sx={{mt: 2}}
              />
              </LocalizationProvider>
              <TextField
                margin="normal"
                error={!pointsEarned}
                required
                name="pointsEarned"
                label="Points"
                type="number"
                id="pointsEarned"
                onChange={(e) => setPointsEarned(e.target.value)}
                sx={{ml: 2}}
              />
              <InputLabel> Event Type?* </InputLabel>
              <Select
                value={type}
                error={!type}
                onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value={'Sport'}>Sports</MenuItem>
                  <MenuItem value={'FBLA'}>FBLA</MenuItem>
                  <MenuItem value={'Robotics'}>Robotics</MenuItem>
                  <MenuItem value={'Chess'}>Chess</MenuItem>
                  <MenuItem value={'Volunteering'}>Volunteering</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                </Select>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Create
              </Button>

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
              



    </Box>
    </div>
  )
}

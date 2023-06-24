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
import { Navigate } from 'react-router-dom'; 


export default function PrizeCreator() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //this is needed for verifying if the user is an admin (and for the 'creator' field)
    const {user} = UserAuth();
    const [currentUserDoc, setCurrentUserDoc] = useState(null);

    //form fields
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [imageURL, setimageURL] = useState('');
    const [prizeType, setPrizeType] = useState('');

    //add prize to firestore
    const addPrize = async () => {
        try{
            await addDoc(collection(db, "prizes"), {
                creator: currentUserDoc.id,
                description: description,
                name: name,
                imageURL: imageURL,
                prizeType: prizeType,
                winner: null
            });
            setSuccess('Prize created successfully!');
        } catch(e){
            console.log(e.message);
            setError(e.message);
        }}

    const handleSubmit = (event) => {
        event.preventDefault();

        if(!name || !description || !prizeType){
            setError('Invalid or empty input(s). Please try again.');
            return;
        } else{
            setError('');
            setSuccess('');
            addPrize();
        }
    }

    //get the current user data when `user` is defined
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

  return (
    <div>
        {(currentUserDoc && !currentUserDoc.data().isAdmin)? <Navigate to="/" /> : null}
        <Typography component="h1" variant="h5">
            Create a Prize
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
                error={!name}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Prize Name"
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
                label="Prize Description"
                name="description"
                autoFocus
                multiline
                rows={4}
                onChange={(e) => 
                  setDescription(e.target.value)
                }
              />
            <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Image URL"
                name="name"
                autoFocus
                onChange={(e) => 
                  setimageURL(e.target.value)
                }
              />
              <InputLabel> Prize Type?* </InputLabel>
              <Select
                value={prizeType}
                error={!prizeType}
                onChange={(e) => setPrizeType(e.target.value)}
                >
                  <MenuItem value={'r'}>Random</MenuItem>
                  <MenuItem value={'r9'}>Random 9th Grader</MenuItem>
                  <MenuItem value={'r10'}>Random 10th Grader</MenuItem>
                  <MenuItem value={'r11'}>Random 11th Grader</MenuItem>
                  <MenuItem value={'r12'}>Random 12th Grader</MenuItem>
                  <MenuItem value={'mostpoints'}>Most Points</MenuItem>

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

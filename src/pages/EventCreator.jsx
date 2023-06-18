import React from 'react'
import { Box, TextField, Button, Typography, Select, InputLabel, MenuItem } from '@mui/material'
import { Alert } from '@mui/material';
import { useState } from 'react';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { UserAuth } from '../contexts/AuthContext';
import dayjs, {Dayjs} from 'dayjs';


export default function EventCreator() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //this is needed for verifying if the user is an admin (and for the 'creator' field)
    const {user} = UserAuth();
    
    //form fields
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [pointsEarned, setPointsEarned] = useState('');
    const [time, setTime] = useState(dayjs());
    const [type, setType] = useState('');


    const handleSubmit = (event) => {
        event.preventDefault();
    }


  return (
    <div>
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
    </Box>
    </div>
  )
}

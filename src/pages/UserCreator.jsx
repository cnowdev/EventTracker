import React from 'react'
import { Box, TextField, Button, Typography, Select, InputLabel, MenuItem } from '@mui/material'
import { Alert } from '@mui/material';
import { useState } from 'react';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { UserAuth } from '../contexts/AuthContext';

export default function UserCreator() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const {user} = UserAuth();
  

    //form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [GPA, setGPA] = useState('');
    const [grade, setGrade] = useState('');
    const [name, setName] = useState('');
    const [admin, setAdmin] = useState(false);


    //email validator 
    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };
    
        const handleSubmit = async (event) => {
        event.preventDefault();

        if(!email || !password || !GPA || !grade || GPA < 0 || GPA > 4 || grade < 9 || grade > 12 || !validateEmail(email) || password.length < 6){
            setError('Invalid or empty input(s). Please try again.');
            return;
        } else {
          event.preventDefault();
          try{
            setError('');
            setSuccess('');
            const createUserAccount = httpsCallable(functions, 'createUserAccount');
            createUserAccount({email: email, password: password, uid: user.uid, gpa: GPA, grade: grade, name: name, admin: admin}).then((result) => {
              console.log(result.data);
              if(result.data.status === 'complete'){
                setSuccess('User created successfully!');
              } else {
                setError(result.data.message + ', that email may already be in use.');
              }
            });
            
          }catch(e){
            console.log(e.message);
            setError(e.message);
          }


        }

        
    }
  return (
    <div>
        <Typography component="h1" variant="h5">
            Create a User
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                error={!name}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoFocus
                onChange={(e) => 
                  setName(e.target.value)
                }
              />
              <TextField
                error={!email || !validateEmail(email)? true : false}
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoFocus
                onChange={(e) => 
                  setEmail(e.target.value)
                }
              />
              <TextField
                margin="normal"
                error={!password || password.length < 6? true : false}
                helperText={!password || password.length < 6? 'Password must be at least 6 characters long.' : null}
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                error={!GPA || GPA < 0 || GPA > 4? true : false}
                required
                name="GPA"
                label="GPA"
                type="number"
                id="gpa"
                onChange={(e) => setGPA(e.target.value)}
              />
             <TextField
                margin="normal"
                error={!grade || grade < 9 || grade > 12? true : false}
                required
                name="Grade"
                label="Grade"
                type="number"
                id="grade"
                sx={{ml: 2}}
                onChange={(e) => setGrade(e.target.value)}
              />
              <InputLabel> Admin? </InputLabel>
              <Select
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
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

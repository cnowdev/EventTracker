import React from 'react'
import { Box, TextField, Button, Typography, Select, InputLabel, MenuItem } from '@mui/material'
import { Alert } from '@mui/material';
import { useState } from 'react';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { UserAuth } from '../contexts/AuthContext';
import IosShareIcon from '@mui/icons-material/IosShare';
import Papa from 'papaparse';

export default function UserCreator() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState('');
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
            setLoading("Creating User... Please don't refresh the page.")
            const createUserAccount = httpsCallable(functions, 'createUserAccount');
            createUserAccount({email: email, password: password, uid: user.uid, gpa: parseFloat(GPA), grade: parseInt(grade), name: name, admin: admin}).then((result) => {
              console.log(result.data);
              setLoading('');
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

//upload data error, success, loading state
const [fileError, setFileError] = useState("");
const [fileSuccess, setFileSuccess] = useState("");
const [fileLoading, setFileLoading] = useState("");

//
const [fileData, setFileData] = useState(null);

    

        
        const handleFileChange = (e) => {     
          setFileError("");
   
          // Check if user has entered the file
          if (e.target.files.length) {
              const inputFile = e.target.files[0];
   
              // Check the file extensions, if it not
              // included in the allowed extensions
              // we show the error
              const fileExtension = inputFile?.type.split("/")[1];
              if (fileExtension !== "csv") {
                  setFileError("Please input a csv file");
                  return;
              }

   
              // If input type is correct set the state
              
              Papa.parse(inputFile, {
                header: true,
                complete: (results) => {
                  setFileData(results.data);
                },
                 error: (error) => {
                  setFileError(error.message);
                }
              });
          }
      };

      const userDataSubmit = () => {
        if(!fileData){
          setFileError('No file data');
          return;
        }
        //check if invalid file data
        if(!fileData || !fileData[0].hasOwnProperty('email') || !fileData[0].hasOwnProperty('password') || !fileData[0].hasOwnProperty('admin') || !fileData[0].hasOwnProperty('gpa') || !fileData[0].hasOwnProperty('grade') || !fileData[0].hasOwnProperty('name') || !fileData[0].hasOwnProperty('points')){
          setError('Invalid file data. Make sure you have all required fields (email, password, admin, gpa, grade, name, points)');
          return;
      } else {
        try{
          setFileError('');
          setFileSuccess('');
          setFileLoading("Creating User... Please don't refresh the page.")
          const importUserData = httpsCallable(functions, 'importUserData');
          importUserData({userData: fileData}).then((result) => {
            console.log(result.data);
            setFileLoading('');
            if(result.data.status === 'complete'){            
              setFileSuccess('Users created successfully!');
            } else {
              setFileError(result.data.message + ', that email may already be in use.');
            }
          });
          
        }catch(e){
          console.log(e.message);
          setFileError(e.message);
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
              {loading?
              <Alert 
              variant='filled'
              severity='info'
              sx={{mt:2}}
              >{loading}</Alert> : null
              } 
              



            </Box>


<Typography variant='h4' sx={{mt: 2, ml: 90}}> OR </Typography>

<Box>
<Button color='info' variant='contained' component="label" startIcon={<IosShareIcon />} sx={{mt: 6, width: 750, ml: 46}} >
  <input
onChange={handleFileChange}
type="file"
name='upload data'  
  /> 
Upload User Data
</Button>
<br></br>





<Button color='success' variant='contained' 
sx={{ml: 83, mt: 3}}
onClick={() => {
console.log(fileData);
userDataSubmit();
}}> Submit User Data </Button>


{fileError?
              <Alert 
              variant='filled'
              severity='error'
              sx={{mt:2}}
              >{fileError}</Alert> : null
              } 

              {fileSuccess?
              <Alert 
              variant='filled'
              severity='success'
              sx={{mt:2}}
              >{fileSuccess}</Alert> : null
              } 
              {fileLoading?
              <Alert 
              variant='filled'
              severity='info'
              sx={{mt:2}}
              >{fileLoading}</Alert> : null
              } 

</Box>


    </div>
  )
}

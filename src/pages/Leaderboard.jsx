import React, { useEffect, useState } from 'react'
import { DataGrid, renderActionsCell } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, getDoc, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { Button, Input } from '@mui/material';
import { UserAuth } from '../contexts/AuthContext';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Papa from 'papaparse';
import IosShareIcon from '@mui/icons-material/IosShare';

export default function Leaderboard() {
    const {user} = UserAuth();  
    const [admin, setAdmin] = useState(false);
    const [rows, setRows] = React.useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    
    //const rows = [{id: 1, col1: 'Hello', col2: 'World', col3: 30}, {id: 2, col1: 'XGrid', col2: 'is Awesome', col3: 40}, {id: 3, col1: 'Material-UI', col2: 'is Amazing', col3: 50}];
    const columns = [{field: 'col1', headerClassName: 'columncolor', headerName: 'Name', width: 300}, 
    {field: 'col2', headerClassName: 'columncolor', headerName: 'Grade', width: 300}, 
    {field: 'col3', headerClassName: 'columncolor', headerName: 'Points', width: 100},
  ]
    

  //user editor variables
  const [name, setName] = useState('');
  const [gpa, setGpa] = useState('');
  const [points, setPoints] = useState('');
  const [grade, setGrade ] = useState('');
  const [adminStatus, setAdminStatus] = useState(false);
  const [currentID, setCurrentID] = useState(''); //current editing user id

  //user editor error success and loading vars:
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(''); 

  const[warning, setWarning] = useState('');

  //Modal stuff
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setError('');
    setSuccess('');
    setLoading('');
    setOpen(true);
  }
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    height: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  //check for invalid inputs, if valid, update user data
  const handleSubmit = (event) => {
    event.preventDefault();
    if(!name || !gpa || !points || !grade || gpa < 0 || gpa > 4 || grade < 9 || grade > 12 || points < 0){
      setError('empty or invalid input(s)');
    } else{
      try{ 
        setError('');
        setLoading("Loading... please don't refresh your browser");
        updateUserData();
        setLoading('');
        setSuccess("User data updated successfully!");
      } catch(e){
        setError(e.message);
      }
    }



  }


//get all user data from firestore, order by pts
    const getData = async() => {
      const q = query(collection(db, "users"), orderBy("points", "desc"));
      const querySnapshot = await getDocs(q);

      console.log(querySnapshot);
      setAllUsers(querySnapshot.docs.map(doc => doc.data()));
      setRows(querySnapshot.docs.flatMap(doc => {   
        if(doc.data().admin){
          return [];
        }
      
        return {
          id: doc.id,
          col1: doc.data().name,
          col2: parseInt(doc.data().grade),
          col3: parseInt(doc.data().points),
        }
      }));
    }

    //get user data given an ID. Used in user editor modal
    const getUserData = async(id) => {
      setCurrentID(id);
      const userDoc = await getDoc(doc(db, 'users', id));
      setName(userDoc.data().name);
      setGpa(userDoc.data().gpa);
      setPoints(userDoc.data().points);
      setGrade(userDoc.data().grade);
      setAdminStatus(userDoc.data().admin);      
    }

    //update user data in firestore
    const batch = writeBatch(db);
    const updateUserData = async() => {
      if(currentID){
        const userRef = doc(db, 'users', currentID);
        console.log(name, gpa, points, grade, adminStatus);
        console.log(currentID);
        batch.update(userRef, {
          name: name,
          gpa: parseFloat(gpa),
          points: parseInt(points),
          grade: parseInt(grade),
          admin: adminStatus,
        });
  
        await batch.commit();
      }else {
        console.log('no row')
      }
    }

    

//if a user object exists, fetch their admin statu
    React.useEffect(() => {
      if(user.uid){
        const fetchAdminStatus = async() => {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          console.log(userDoc.data().admin);
          setAdmin(userDoc.data().admin);
        }
        
        fetchAdminStatus();
        console.log(admin);
      }

    }, [user]);
   
//get all user data on page render
    useEffect(() => {
      getData();

    }, []);






  return (
    <Box
    sx={{

        '& .columncolor': {
            backgroundColor: '#1976d2',
            color: 'white'
    }}}
    
    >
     <DataGrid
  sx={{
    width: '47%',
    margin: 'auto',
    backgroundColor : '#ffffff',
  }}
  rows={rows}
  columns={columns}
  onRowClick={(row) => {
    setSelectedRow(row.id);
  }
  }
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 20 },
    },

  }}

/> 
{admin && <Button sx={{ml: 81, mt: 2}}variant="contained" color='success' startIcon={<IosShareIcon />} onClick={() => {
            const csvData = Papa.unparse(allUsers);
            const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            window.open(URL.createObjectURL(csvBlob));
}}>Export User Data</Button>}






{admin && <Button variant="contained" 
sx={
  {margin: 'auto', display: 'block', marginTop: '20px', marginBottom: '20px', color: 'white', width: '50%'}
}
onClick={() => {  
  if(selectedRow){
    getUserData(selectedRow);
    handleOpen();
  } else{
    setWarning('Please select a user to edit');
  }
}
}>Edit Selected User</Button>}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h4" component="h2">
            User Editor
          </Typography>
          <Typography id="modal-modal-title" variant="h7" component="h2">
            Currently Editing: {name}
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
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                error={!gpa || gpa < 0 || gpa > 4? true : false}
                required
                name="GPA"
                label="GPA"
                type="number"
                id="gpa"
                value={gpa}
                onChange={(e) => {
                  setGpa(e.target.value)}
                }
              />
              <TextField
                sx={{ml: 2}}
                margin="normal"
                error={points < 0}
                required
                name="Points"
                label="Points"
                type="number"
                id="points"
                value={points}
                onChange={(e) => {
                  setPoints(e.target.value)}
                }
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
                value={grade}
                onChange={(e) => {setGrade(e.target.value)}}
              />
              <InputLabel> Admin? </InputLabel>
              <Select

                value={adminStatus}
                onChange={(e) => {
                  setAdminStatus(e.target.value);
                }
                }
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
                Edit
              </Button>
              <Button
                fullWidth
                variant="contained"
                color='error'
                sx={{ mt: 1, mb: 2 }}
                onClick={async() => {
                  handleClose();
                  await deleteDoc(doc(db, 'users', currentID));
                }}
              >
                Delete
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

        </Box>
      </Modal>
      {warning?
              <Alert 
              variant='filled'
              severity='warning'
              sx={{mt:2}}
              >{warning}</Alert> : null
              }  
</Box>


    
  )
}

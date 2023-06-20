import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card';
import { Button, CardActionArea, CardActions } from '@mui/material';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Item from '@mui/material/Grid';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAuth } from '../contexts/AuthContext';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import { Label } from '@mui/icons-material';

export default function Prizes() {

const {user} = UserAuth();
const [admin, setAdmin ] = useState(false);

 const [prizes, setPrizes] = useState([]);
 const [creatorInfo, setCreatorInfo] = useState({});

//prizeEditor vars
 const [prizeID, setPrizeID] = useState('');
 const [prizeName, setPrizeName] = useState('');
 const [prizeDescription, setPrizeDescription] = useState('');
 const [prizeImageURL, setPrizeImageURL] = useState('');
 const [prizeType, setPrizeType] = useState('');

//editor error, loading, and success states
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 //Prize editor modal vars
 const [open, setOpen] = React.useState(false);
 const handleOpen = () => {
  setError('');
  setSuccess('');
  setLoading('');
  setOpen(true);
}
const handleClose = () => setOpen(false);

 const handleSubmit = (event) => {
  event.preventDefault();

  if(!prizeName || !prizeDescription || !prizeImageURL || !prizeType){
    setError('Invalid or Empty Input(s). Please try again.');
 } else{
  try{
    setError('');
    setLoading("Loading... Please don't refresh your browser.");
    setSuccess('');

    updatePrizeData();
    setLoading('');
    setSuccess('Prize successfully updated!');
  } catch(e) {
    setLoading('');
    setError(e.message);
  }
 }

}


const batch = writeBatch(db);
const updatePrizeData = async() => {
  const prizeRef = doc(db, 'prizes', prizeID);
  
  batch.update(prizeRef, {
  name: prizeName,
  description: prizeDescription,
  imageURL: prizeImageURL,
  prizeType: prizeType 
  });

  batch.commit();
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  height: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};




const getCreatorInfo = async(creatorRef) => {
  const q = await getDoc(creatorRef);
  setCreatorInfo(q.data());
}

  const getPrizes = async() => {
    const q = query(collection(db, 'prizes'));
    const querySnapshot = await getDocs(q);
    setPrizes(querySnapshot.docs);
  }

  let initialized = false;
  useEffect(() => {
    if(!initialized){
      initialized = true;
      getPrizes();

    }

  }, []);

  useEffect(() => {
    if(user) {
      const fetchAdminStatus = async() => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setAdmin(userDoc.data().admin);
    }

    fetchAdminStatus();
  }
  }, [user]);



  const usePrizes = prizes.map((prize) => {
    getCreatorInfo(prize.data().creator);
    return <Grid item xs={4}>
    <Item>
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia 
      sx={{height: 140}}
      image={prize.data().imageURL}
      title='prize image'
      />
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {prize.data().name}
          </Typography>
          <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}>
            Created by: {creatorInfo.name}
          </Typography>
          <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
            Winner: {prize.data().winner? prize.data().winner : "No winner yet"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {prize.data().description}
          </Typography>

          {admin && <Button 
          variant="contained" 
          color="primary" sx={{mt: 2}}
          onClick={() => {  
            setPrizeID(prize.id);
            setPrizeName(prize.data().name);
            setPrizeDescription(prize.data().description);
            setPrizeImageURL(prize.data().imageURL);
            setPrizeType(prize.data().prizeType);
            handleOpen();
          }
          }
          > Edit Prize </Button>}
        </CardContent>
      </CardActionArea>
      <CardActions>
      </CardActions>
    </Card>
    </Item>
  </Grid>
  });

  return (
  <div>
   <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
    {usePrizes}
   </Grid>

   <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
      <Box sx={modalStyle}>
      <Typography id="modal-modal-title" variant="h4" component="h2">
            Prize editor
          </Typography>
          <Typography id="modal-modal-title" variant="h7" component="h2">
            Currently Editing: {prizeName}
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            error={!prizeName}
            margin="normal"
            required
            fullWidth
            id="name"
            label="Prize Name"
            name="name"
            autoFocus
            value={prizeName}
            onChange={(e) => {
                  setPrizeName(e.target.value);
            }}
          />
          <TextField
            error={!prizeDescription}
            margin="normal"
            required
            fullWidth
            id="description"
            label="Prize Description"
            name="description"
            autoFocus
            multiline
            rows={4}
            value={prizeDescription}
            onChange={(e) => 
              setPrizeDescription(e.target.value)
                }
          />
          <TextField
            margin="normal"
            fullWidth
            id="imageURL"
            label="image URL"
            name="imageURL"
            autoFocus
            value={prizeImageURL}
            onChange={(e) => {
                  setPrizeImageURL(e.target.value);
            }}
          />
              <Select
                sx={{mt: 2, ml: 2}}
                value={prizeType}
                error={!prizeType}
                label="Prize Type"
                onChange={(e) => setPrizeType(e.target.value)}
                >
                  <MenuItem value={'Food'}>Food</MenuItem>
                  <MenuItem value={'School'}>School</MenuItem>
                  <MenuItem value={'School Spirit'}>School Spirit</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                </Select>
          
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Edit
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
  </div>
  )
}

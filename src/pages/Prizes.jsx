import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card';
import { Button, CardActionArea, CardActions } from '@mui/material';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Item from '@mui/material/Grid';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot } from 'firebase/firestore';
import { db } from '../firebase';


export default function Prizes() {

const [prizes, setPrizes] = useState([]);
const [creatorInfo, setCreatorInfo] = useState({});


const getCreatorInfo = async(creatorRef) => {
  const q = await getDoc(creatorRef);
  setCreatorInfo(q.data());
}

  const getPrizes = async() => {
    const q = query(collection(db, 'prizes'));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
      setPrizes((prev) => [...prev, doc.data()]);
    })
  }

  let initialized = false;
  useEffect(() => {
    if(!initialized){
      initialized = true;
      getPrizes();

    }

  }, []);



  const usePrizes = prizes.map((prize) => {
    getCreatorInfo(prize.creator);
    return <Grid item xs={4}>
    <Item>
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia 
      sx={{height: 140}}
      image={prize.imageURL}
      title='prize image'
      />
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {prize.name}
          </Typography>
          <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}>
            Created by: {creatorInfo.name}
          </Typography>
          <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
            Winner: {prize.winner? prize.winner : "No winner yet"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {prize.description}
          </Typography>
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
  </div>
  )
}

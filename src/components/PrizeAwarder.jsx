import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card';
import { Button, CardActionArea, CardActions } from '@mui/material';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Item from '@mui/material/Grid';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot, writeBatch, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAuth } from '../contexts/AuthContext';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import { Label } from '@mui/icons-material';


export default function PrizeAwarder() {

    const [winnablePrizes, setWinnablePrizes] = useState([]);
    const [prizeWinners, setPrizeWinners] = useState([]);


    //error, success, loading states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const getWinnablePrizes = async() => {
        const q = query(collection(db, 'prizes'), where('winner', '==', null));
        const querySnapshot = await getDocs(q);
        setWinnablePrizes(querySnapshot.docs);
    }

    
    const getPrizeWinner = async(type) => {
        console.log(type);
        if(type === 'r'){
            //get a completely random user
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const randomIndex = Math.floor(Math.random() * querySnapshot.docs.length);
            return querySnapshot.docs[randomIndex];
        } else if(type === 'mostpoints'){
            //get user with the most points
            const q = query(collection(db, 'users') , orderBy('points', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs[0];
        } else {
            //get random winner by grade
            const grade = type.slice(1);
            const q = query(collection(db, 'users'), where('grade', '==', parseInt(grade)));
            const querySnapshot = await getDocs(q);
            querySnapshot.docs.length === 0? setError('Error trying to assign a prize: there are no users in this grade') : setError('');
            const randomIndex = Math.floor(Math.random() * querySnapshot.docs.length);
            return querySnapshot.docs[randomIndex];
        }
    }


    const awardPrizes = async() => {
        if(winnablePrizes.length === 0){
            console.log('empty array');
            return;
        }
        const batch = writeBatch(db);
        let itemsProcessed = 0;
        winnablePrizes.forEach(async(prize, index, array) => {
                const winnerUser = await getPrizeWinner(prize.data().prizeType);
                batch.update(doc(db, 'prizes', prize.id), {winner: doc(db, 'users', winnerUser.id)});
                setPrizeWinners((prev) => [...prev, {
                    prize: prize.data(),
                    winner: winnerUser.data()
                }]);

            itemsProcessed++;
            if(itemsProcessed === array.length){
                batch.commit();
            }
        });
 
    }

    let initialized = false;
    useEffect(() => {
      if(!initialized){
        initialized = true;
        getWinnablePrizes();  
      }  
    }, []);
  



  return (
    <div>
        <Typography id="modal-modal-title" variant="h4" component="h2">
            Award Prizes
        </Typography>

        <Button variant='contained' color='success' onClick={() => {
            awardPrizes();
        } }sx={{mt: 2}}>Award Prizes</Button>



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
    </div>
  )
}

import React, { useEffect } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import Grid from '@mui/material/Grid';

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, {Dayjs} from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot } from 'firebase/firestore';
import { UserAuth } from '../contexts/AuthContext';



export default function Events() {
  const [calendarValue, setCalendarValue] = useState(dayjs());
  const [events, setEvents] = useState([])
  const eventsRef = collection(db, 'events');
  const [creatorInfo, setCreatorInfo] = useState({});
  const {user} = UserAuth();
  const currentUserRef = doc(db, 'users', user.uid);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  const getCreatorInfo = async(creatorRef) => {
    const q = await getDoc(creatorRef);
    setCreatorInfo(q.data());
  }

  const addPoints = async(val) => {
    console.log(typeof(val));
    console.log(val);

    await updateDoc(currentUserRef, {
      points: increment(val) 
    })

  }

  const registerEvent = async(eventid) => {
    const eventRef = doc(db, 'events', eventid);
    await addDoc(collection(db, "eventsignups"), {
      event: eventRef,
      user: currentUserRef,
      verified: false
    });
    
  }

  const getRegisteredEvents = async() => {
    const q = query(collection(db, 'eventsignups'), where("user", "==", currentUserRef));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
      setRegisteredEvents((prev) => [...prev, doc.data().event.id]);
    })

    console.log(registeredEvents);
  }

  const updateCards = async(val) => {
    let theDay = new Date(val.toDate().toDateString());
    let theNextDay = new Date(val.add(1, 'day').toDate().toDateString());


    const q = query(eventsRef, where("time", ">=", theDay), where("time", "<", theNextDay), where("time", ">=", new Date()));
    const querySnapshot = await getDocs(q);
    setEvents(querySnapshot.docs);
  }

  const useEvents = events.map((doc) => {
      let registerStatus = registeredEvents.includes(doc.id);
      getCreatorInfo(doc.data().creator)


      return (
        <Card sx={{ maxWidth: 400, mt:5 }}>
        <CardActionArea>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {doc.data().name}
            </Typography>
            <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}>
              Created by: {creatorInfo.name}
            </Typography>
            <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
              {doc.data().time.toDate().toLocaleString()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {doc.data().description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" variant='contained' color='success' disabled={registerStatus? 'true' : ''} onClick={() => {
            setRegisteredEvents((prev) => [...prev, doc.id]);
            addPoints(doc.data().pointsEarned);
            registerEvent(doc.id);
            }} >
            Register
          </Button>
        </CardActions>
      </Card>
        )

  })


useEffect(() => {

getRegisteredEvents();


}, []);
  


  return (
    <div>


    <Grid container>
      <Grid item sm={7}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DateCalendar component='div' value={calendarValue} onChange={(newVal) => {
      setCalendarValue(newVal);
      updateCards(newVal);

    }}sx={{
      backgroundColor: '#ffffff',
      scale: '2',
      mt: '10vw',
      ml: '10vw',
      mr: '0vw',
  }} />
    </LocalizationProvider>
      </Grid>
      
      <Grid item sm={5}>


        {useEvents}




    
      </Grid>

      </Grid>




      </div>


  )
}

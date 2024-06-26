import React, { useEffect, useRef, useState } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Badge, Button, CardActionArea, CardActions } from '@mui/material';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, {Dayjs} from 'dayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { UserAuth } from '../contexts/AuthContext';
import { PickersDay } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';


export default function Home() {
  const [allEvents, setAllEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [prizesWon, setPrizesWon] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});
  const { user } = UserAuth();
  
  const [commonRegisterType, setCommonRegisterType] = useState("");

  const [useRecEvents, setUseRecEvents] = useState([]);


  //get every event from firestore
  const getAllEvents = async() => {
    const q = query(collection(db, 'events'));
    const querySnapshot = await getDocs(q);
    setAllEvents(querySnapshot.docs);
  }

  //get the current user's data
  const getCurrentUserData = async() => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    setLoggedInUser(userDoc.data());
  }

  //get events where the user is registered, and other info like if it's verified or not
  const getRegisteredEventIDs = async() => {
    const q = query(collection(db, 'eventsignups'), where("user", "==", doc(db, 'users', user.uid)));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
      if(!doc.data().verified){
        setRegisteredEvents((prev) => [...prev, {
          id: doc.id,
          userID: doc.data().user.id,
          eventID: doc.data().event.id,
          verified: doc.data().verified,
          eventType: doc.data().eventType}]);
      }

    })

    console.log(registeredEvents);
  }

  //get all the prizes the current user has won
  const getPrizesWon = async() => { 
    const q = query(collection(db, 'prizes'), where('winner', '==', doc(db, 'users', user.uid)));
    const querySnapshot = await getDocs(q);

    setPrizesWon(querySnapshot.docs);
  }

  //convert prizeType from firestore into a readable string
  const getPrizeTypeString = (prizeType) => {
    switch(prizeType){
      case 'r':
        return "Complete Random";
      case 'r9':
        return "Random 9th Grader";
      case 'r10':
        return "Random 10th Grader";
      case 'r11':
        return "Random 11th Grader";
      case 'r12':
        return "Random 12th Grader";
      case 'mostpoints':
        return 'Most Points'
    }
  }


  //function returns the most common element in an array
  function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

  const getReccomendedEventType = () => {
    let eventTypes = [];
    registeredEvents.forEach((e) => {
      eventTypes.push(e.eventType);
    });
    setCommonRegisterType(mode(eventTypes));
  }

//when we get the user's common register type, we can use it to get reccomended events
  useEffect(() => {

    getReccomendedEventType();

    setUseRecEvents(allEvents.flatMap((eventDoc) => {
      console.log(commonRegisterType);
      // if registered events HAS event id, or the event is before today, or the event type isn't what we want, return null
      if( (registeredEvents.filter((e) => e.eventID === eventDoc.id).length > 0) || (eventDoc.data().time.toDate() < new Date()) || (eventDoc.data().type !== commonRegisterType)) {
        return [];
      } else {
        return <Grid item xs={4}>
        <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {eventDoc.data().name}
            </Typography>
            <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}>
              Created by: admin
            </Typography>
            <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
              {eventDoc.data().time.toDate().toLocaleString()}
            </Typography>
            <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
              Points Awarded: {eventDoc.data().pointsEarned}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {eventDoc.data().description}
            </Typography>
            <Typography variant="body3" color="green" component="div" gutterBottom sx={{mb: 1}}>
            Points: {eventDoc.data().pointsEarned}
          </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
         <Typography variant="body9" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}> Register for this event in the Events tab!</Typography>
        </CardActions>
      </Card>
        </Grid>
      };
    })); 
  }, [registeredEvents, commonRegisterType, allEvents]);




//when the user object is defined, get their registered events, prizes won, and current user data
  React.useEffect(() => {
    if(user.uid){
      
      getRegisteredEventIDs()
      getPrizesWon();
      getCurrentUserData();
    }

  }, [user]);


//on page render get all events
  let initialized = false;
  useEffect(() => {
    if(!initialized){
      initialized = true;
      getAllEvents();

    }

  }, []);
  
  //map all events to cards
  const useEvents = allEvents.flatMap((eventDoc) => {
    // if registered events dosen't have the event id, or the event is verified (this is checked earlier in another function), return null
    if( (!registeredEvents.filter((e) => e.eventID === eventDoc.id).length > 0) || (eventDoc.data().time.toDate() < new Date()) ) {
      return [];
    } else {
      return <Grid item xs={4}>
      <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {eventDoc.data().name}
          </Typography>
          <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}>
            Created by: admin
          </Typography>
          <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
            {eventDoc.data().time.toDate().toLocaleString()}
          </Typography>
          <Typography variant="body3" color="green" component="div" gutterBottom sx={{mb: 1}}>
            Points: {eventDoc.data().pointsEarned}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {eventDoc.data().description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
        size="small"
        variant='contained'
        color="error"
        onClick={async() => {
          await deleteDoc(doc(db, 'eventsignups', registeredEvents.filter((e) => e.eventID === eventDoc.id)[0].id));
          setRegisteredEvents((prev) => prev.filter((e) => e.eventID !== eventDoc.id));
        }}>
          Unregister  
        </Button>
      </CardActions>
    </Card>
      </Grid>
    };
  });

  //map all prizes the user has won to cards
  const usePrizes = prizesWon.map((prizeDoc) => {
    return <Grid item xs={4}>
    <Card sx={{ maxWidth: 345 }}>
    <CardMedia 
      sx={{height: 140}}
      image={prizeDoc.data().imageURL}
      title='prize image'
      />
    <CardActionArea>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {prizeDoc.data().name}
        </Typography>
        <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1, fontWeight: 'bold'}}>
          Created by: admin
        </Typography>
        <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
          Prize Type: { getPrizeTypeString(prizeDoc.data().prizeType)}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {prizeDoc.data().description}
        </Typography>
      </CardContent>
    </CardActionArea>
    <CardActions>
    </CardActions>
  </Card>
    </Grid>
  });





  return (
    <div>
      <Typography variant='h3' sx={{fontWeight: 'bold', mb: 2}}>Welcome back, {loggedInUser.name}</Typography>
      <Typography variant='h5' sx={{color: 'green', mb: 2, mt: 0}}>Your Points: {loggedInUser.points}</Typography>
      <Typography variant='h4' sx={{fontWeight: 'bold', mb: 2}}>Your Events</Typography>
      <Grid container spacing={3}>
      {useEvents.length > 0? useEvents : <Typography variant="body1" color="text.secondary" sx={{mt: 2, ml: 4}}> You don't have any upcoming events.... </Typography>}

    </Grid>
    <Typography variant='h4' sx={{fontWeight: 'bold', mb: 2, mt: 2}}>Your Prizes</Typography>
      <Grid container spacing={3}>
      {usePrizes.length > 0? usePrizes : <Typography variant="body1" color="text.secondary" sx={{mt: 2, ml: 4}}> You haven't won any prizes </Typography>}
    </Grid>
    <Typography variant='h4' sx={{fontWeight: 'bold', mt: 2, mb: 2}}>Events For You:</Typography>
      <Grid container spacing={3}>
      {useRecEvents.length > 0? useRecEvents : <Typography variant="body1" color="text.secondary" sx={{mt: 5, ml: 4}}> There are no events for you yet... </Typography>}
    </Grid>
    </div>
  )
}

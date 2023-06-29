import React, { useEffect, useRef } from 'react'
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
import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { UserAuth } from '../contexts/AuthContext';
import { PickersDay } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';





export default function Events() {



  const [calendarValue, setCalendarValue] = useState(dayjs());
  const [events, setEvents] = useState([])
  const [allCurrentEvents, setAllCurrentEvents] = useState([]);
  const eventsRef = collection(db, 'events');
  const [creatorInfo, setCreatorInfo] = useState({});
  const {user} = UserAuth();

  //if a user dosen't exist, set page to loading
  if(!user){
    return <h1>Loading...</h1>
  }

  //all registered events state
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [admin, setAdmin] = useState(false);

  const [highlightedDays, setHighlightedDays] = useState([]);


  //error, loading, and success states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //all users state
  const [allUsers, setAllUsers] = useState([]);

  //event editor vars
  const [eventID, setEventID] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription , setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState(dayjs());
  const [eventType, setEventType] = useState('');

  const isBeforeRightNow = (date) => {

    return date < new Date();
  }


  //fetches all users from firestore
  const getAllUsers = async() => {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    setAllUsers(querySnapshot.docs);
  }

  const handleSubmit = (event) => {
    
    //check for invalid inputs
    event.preventDefault();
    if(!eventName || !eventDescription || !eventTime || !eventType || isBeforeRightNow(eventTime.toDate())){
      setError('Invalid or empty input(s). Please try again.');
    } else{
        try{
          setError('');
          setLoading("Loading.. Please don't refresh your browser...");
          updateEventData();
          setLoading('');
          setSuccess('Event updated successfully!');
        } catch(e) {
          setError(e.message);
        }

    }
  }

//get creator info
  const getCreatorInfo = async(creatorRef) => {
    const q = await getDoc(creatorRef);
    setCreatorInfo(q.data());
  }

  //create a writebatch to update the event
  const batch = writeBatch(db);

  //update event data with data from event editor
  const updateEventData = async() => {
    const eventRef = doc(db, 'events', eventID);
    console.log(eventName, eventDescription, eventTime.toDate(), eventType);

    batch.update(eventRef, {
      name: eventName,
      description: eventDescription,
      time: eventTime.toDate(),
      type: eventType
    });

    batch.commit();
    }

    //register a user for an event
  const registerEvent = async(eventid, type) => {
    const eventRef = doc(db, 'events', eventid);
    await addDoc(collection(db, "eventsignups"), {
      event: eventRef,
      user: doc(db, 'users', user.uid),
      verified: false,
      eventType: type
    });
    
  }

  //get all registered events for the user
  const getRegisteredEvents = async() => {
    const q = query(collection(db, 'eventsignups'), where("user", "==", doc(db, 'users', user.uid)));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
      setRegisteredEvents((prev) => [...prev, doc.data().event.id]);
    })

    console.log(registeredEvents);
  }

  // get all events that are in the future
  const getAllCurrentEvents = async() => {
    const q = query(collection(db, 'events'), where("time", ">=", new Date()));
    const querySnapshot = await getDocs(q);
    setAllCurrentEvents(querySnapshot.docs);
  }

//update the event cards when the calendar is changed
  const updateCards = async(val) => {
    let theDay = new Date(val.toDate().toDateString());
    let theNextDay = new Date(val.add(1, 'day').toDate().toDateString());


    const q = query(eventsRef, where("time", ">=", theDay), where("time", "<", theNextDay), where("time", ">=", new Date()));
    const querySnapshot = await getDocs(q);
    setEvents(querySnapshot.docs);
  }







//map all events to cards
  const useEvents = events.map((doc) => {
    //if the user is registered for the event, disable the register button
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
              Created by: {allUsers.length > 0? allUsers.find(e => e.id === doc.data().creator.id).data().name : 'couldn not fetch'}
            </Typography>
            <Typography variant="body3" color="text.secondary" component="div" gutterBottom sx={{mb: 1}}>
              {doc.data().time.toDate().toLocaleString()}
            </Typography>
            <Typography variant="body3" color="green" component="div" gutterBottom sx={{mb: 1}}>
            Points: {doc.data().pointsEarned}
          </Typography>
            <Typography variant="body1" color="text.secondary">
              {doc.data().description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" variant='contained' color='success' disabled={registerStatus? 'true' : ''} onClick={() => {
            setRegisteredEvents((prev) => [...prev, doc.id]);
            registerEvent(doc.id, doc.data().type);
            }} >
            Register
          </Button>
          {admin && <Button size="small" variant='contained' color='primary'
          onClick={() => {
            setEventID(doc.id);
            setEventName(doc.data().name);
            setEventDescription(doc.data().description);
            setEventTime(doc.data().time);
            setEventType(doc.data().type);
            handleOpen();
          }
          }
          >Edit event</Button>}


        </CardActions>
      </Card>
        )

  })

//event editor modal vars

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

//custom day component for the calendar, so we can highlight days that have events
function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;



  
  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? '🔴' : undefined}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

//on page render, get All users and all upcoming events
useEffect(() => {

getAllCurrentEvents();
getAllUsers();

}, []);

useEffect(() => {

  //for all future events, add the day of the event to the highlighted days array
allCurrentEvents.map((doc) => {
  setHighlightedDays((prev) => [...prev, doc.data().time.toDate().getDate()]);
})

}, [allCurrentEvents]);


useEffect(() => {

  //fetch admin status of user when the user object is updated
  if(user){
    const fetchAdminStatus = async() => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log(userDoc.data().admin);
      setAdmin(userDoc.data().admin);
    }
    
    
    fetchAdminStatus();
    setLoading(false);
    getRegisteredEvents();
    console.log(admin);
  }

}, [user]);
  


  return (
    <div>


    <Grid container>
      <Grid item sm={7}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>



    <DateCalendar 
    component='div' 
    value={calendarValue}
    slots={{
      day: ServerDay,
    }}
    slotProps={{
      day: {
        highlightedDays,
      },
    }}


    onChange={(newVal) => {
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



      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h4" component="h2">
            Event Editor
          </Typography>
          <Typography id="modal-modal-title" variant="h7" component="h2">
            Currently Editing: {eventName}
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                error={!eventName}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Event Name"
                name="name"
                autoFocus
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                }}
              />
              <TextField
                error={!eventDescription}
                margin="normal"
                required
                fullWidth
                id="description"
                label="Event Description"
                name="description"
                autoFocus
                multiline
                rows={4}
                value={eventDescription}
                onChange={(e) => 
                  setEventDescription(e.target.value)
                }
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                error={!eventTime}
                label="Event Time"
                value={dayjs(eventTime.toDate())}
                onChange={(e) => setEventTime(e)}
                sx={{mt: 2}}
                />
              </LocalizationProvider>
              <Select
                sx={{mt: 2, ml: 2}}
                value={eventType}
                error={!eventType}
                label="Event Type"
                onChange={(e) => setEventType(e.target.value)}
                >
                  <MenuItem value={'Sport'}>Sports</MenuItem>
                  <MenuItem value={'FBLA'}>FBLA</MenuItem>
                  <MenuItem value={'Robotics'}>Robotics</MenuItem>
                  <MenuItem value={'Chess'}>Chess</MenuItem>
                  <MenuItem value={'Volunteering'}>Volunteering</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                </Select>

                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Save
                </Button>
                <Button
                fullWidth
                variant="contained"
                color='error'
                sx={{ mt: 1, mb: 2 }}
                onClick={async() => {
                  handleClose();
                  await deleteDoc(doc(db, 'events', eventID));
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


      </div>


  )
}

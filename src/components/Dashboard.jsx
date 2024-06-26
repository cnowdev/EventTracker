import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';
import { mainListItems, secondaryListItems } from './listitems';
import Button from '@mui/material/Button';
import { UserAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, addDoc, QuerySnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/*
import Chart from './Chart';
import Deposits from './Deposits';
import Orders from './Orders';
*/





const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Dashboard({children}) {



  const [admin, setAdmin] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {logout} = UserAuth();
  const {user} = UserAuth();

//make the page name look readable
  const pageName = (val) => {
    switch(val){
      case 'Faq':
        return 'FAQ';
      case 'Eventcreator':
        return 'Event Creator';
      case 'Usercreator':
        return 'User Creator';
      case 'Prizecreator':
        return 'Prize Creator';
      case 'Eventvalidator':
        return 'Event Validator';
      default:
        return val;
  }
}

//send the user back to the login page and sign them out 
  const handleLogout = async () => {
    try{
      await logout();
      navigate('/');
    }catch(error){
      console.log(error.message);
    }
  }

  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  //when the user object exists, check the admin status of the user to determine how to render the dashboard
  React.useEffect(() => {
    if(user.uid){
      const fetchAdminStatus = async() => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setAdmin(userDoc.data().admin);
      }
      
      fetchAdminStatus();
      console.log(admin);
    }

  }, [user]);

//make the dashboard color red if the page is a admin page.
  const dashboardHeaderColor = (val) => {
    if(val == 'Event Creator' || val == 'User Creator' || val == 'Prize Creator' || val == 'Event Validator'){
      return true;
    } else{ 
      return false
    }
  }
 

  return (


    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px',
              backgroundColor: dashboardHeaderColor(pageName(location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1)))? '#b70000' : process.env.REACTAPP_DASHBOARD_COLOR // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
             {pageName(location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1))}
            </Typography>
           
            <Button variant="contained" color='error' onClick={handleLogout} startIcon={<LogoutIcon />}>Logout</Button>


          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
              {mainListItems}
                
            <Divider sx={{ my: 1 }} />
            {admin? secondaryListItems : null}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: 4, mr: 4}}>
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
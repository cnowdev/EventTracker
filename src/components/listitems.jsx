import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import RedeemIcon from '@mui/icons-material/Redeem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link } from 'react-router-dom';

export const mainListItems = (
<React.Fragment>
    
    <ListItemButton component={Link} to="/home">
      <ListItemIcon>
        <HomeIcon/>
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItemButton>
    <ListItemButton component={Link} to="/leaderboard">
      <ListItemIcon>
        <LeaderboardIcon/>
      </ListItemIcon>
      <ListItemText primary="Leaderboard" />
    </ListItemButton>
    <ListItemButton component={Link} to="/events">
      <ListItemIcon>
        <EventIcon />
      </ListItemIcon>
      <ListItemText primary="Events" />
    </ListItemButton>
    <ListItemButton component={Link} to="/prizes">
      <ListItemIcon>
        <RedeemIcon/>
      </ListItemIcon>
      <ListItemText primary="Prizes" />
    </ListItemButton>
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset sx={{color: 'red'}}>
      Admin Controls
    </ListSubheader>
    <ListItemButton component={Link} to="/usercreator" >
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="User Creator" />
    </ListItemButton>
    <ListItemButton component={Link} to="/eventcreator" >
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Event Creator" />
    </ListItemButton>
    <ListItemButton component={Link} to="/prizecreator">
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Prize Creator" />
    </ListItemButton>
    <ListItemButton component={Link} to="/eventvalidator">
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Event Validator" />
    </ListItemButton>
  </React.Fragment>
);
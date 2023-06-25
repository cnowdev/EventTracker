import { Typography } from '@mui/material'
import React from 'react'

export default function FAQ() {
  return (
    <div>

        <Typography variant='h3'>Frequently Asked Questions</Typography>
        <br/>
        <Typography variant='h5' sx={{fontWeight: 'bold', mt: 2}}>I've registered for an event, but I didn't recieve Points!</Typography>
        <Typography variant='body1' sx={{mt: 2}}> Once you show up for an event, you will need to be validated by an admin. Please contact an admin if you haven't recieved points for an event.</Typography>
        <Typography variant='h5' sx={{fontWeight: 'bold', mt: 2}}>Will my GPA be shown to other users?</Typography>
        <Typography variant='body1' sx={{mt: 2}}> Only administrators can access your sensitive information like your GPA.</Typography>
        <Typography variant='h5' sx={{fontWeight: 'bold', mt: 2}}>Admin: How do I create a User/Event/Prize?</Typography>
        <Typography variant='body1' sx={{mt: 2}}> There are designated pages for the User, Event, and Prize creators. Check the navbar to the left of the page.</Typography>
        <Typography variant='h5' sx={{fontWeight: 'bold', mt: 2}}>Admin: How do I export/import user data?</Typography>
        <Typography variant='body1' sx={{mt: 2}}>User data can be imported on the user creator page. User data can be exported via the leaderboards page.</Typography>






    </div>
  )
}

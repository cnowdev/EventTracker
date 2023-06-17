import React, { useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Leaderboard() {
    const [rows, setRows] = React.useState([]);
    //const rows = [{id: 1, col1: 'Hello', col2: 'World', col3: 30}, {id: 2, col1: 'XGrid', col2: 'is Awesome', col3: 40}, {id: 3, col1: 'Material-UI', col2: 'is Amazing', col3: 50}];
    const columns = [{field: 'col1', headerClassName: 'columncolor', headerName: 'Name', width: 300}, {field: 'col2', headerClassName: 'columncolor', headerName: 'GPA', width: 300}, {field: 'col3', headerClassName: 'columncolor', headerName: 'Points', width: 100}];
    



    const getData = async() => {
      const q = query(collection(db, "users"), orderBy("points", "desc"));
      const querySnapshot = await getDocs(q);

      console.log(querySnapshot);
      setRows(querySnapshot.docs.map(doc => {        
        return {
          id: doc.id,
          col1: doc.data().name,
          col2: doc.data().gpa,
          col3: doc.data().points,
        }
      }));
    }

    useEffect(() => {
      getData();

    }, []);




    /*
      const querySnapshot = db.collection('users').orderBy('points', 'desc').onSnapshot(snapshot => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          col1: doc.data().name,
          col2: doc.data().gpa,
          col3: doc.data().points,
        }))
        setUsers(users)
      });
*/

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
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 20 },
    },

  }}

/> 
</Box>


    
  )
}

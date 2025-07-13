import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import Favorite from './pages/Favorite'
import MyBooking from './pages/MyBooking'
import Movies from './pages/Movies'
import Home from './pages/Home'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import { useAppContext } from './context/AppContext'
import { SignIn, useUser} from '@clerk/clerk-react'
import { Layout } from 'lucide-react'
import Dashboard from './pages/admin/Dashboard'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import AddShow from './pages/admin/AddShows'

function App() {
   const {user} = useAppContext()
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  return (
    <>
    <Toaster/>
     {!isAdminRoute && <Navbar/> }
      <Routes>
       <Route path='/' element={<Home/>}/>
       <Route path='/movies' element={<Movies/>}/>
       <Route path='/movies/:id' element={<MovieDetails/>}/>
       <Route path='/movie/:id/:date' element={<SeatLayout/>}/>
       <Route path='/my-booking' element={<MyBooking/>}/>
       <Route path='/favorite' element={<Favorite/>}/>
      <Route path='/admin/*' element={<Layout/>}>
      <Route path='/admin/*' element={ user ?<Layout/>: (
        <div className='min-h-screen flex justify-center items-center'>
          <SignIn fallbackRedirectUrl={'/admin'}/>
        </div>
      )}/>
      <Route index element={<Dashboard/>}/>
      <Route path='add-shows' element={<AddShow/>}/>
      <Route path='list-shows' element={<ListShows/>}/>
      <Route path='list-bookings' element={<ListBookings/>}/>
      </Route>
      </Routes>

      {!isAdminRoute && <Footer/> }
    </>
  )
}

export default App

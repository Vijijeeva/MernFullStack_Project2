import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import PostView from './pages/PostView';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from "./pages/Search";

function App(){ return (<div><Nav /><main className='container'>
  <Routes>
    <Route path='/' element={<Login />} />
    <Route path='/post/:id' element={<PostView />} />
    <Route path='/create' element={<CreatePost />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/dashboard' element={<Home />} />
    <Route path='/home' element={<Home />} />
    <Route path="/search" element={<Search />} />
  </Routes></main></div>); }
export default App;
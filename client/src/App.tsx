import { useEffect, useReducer, useState} from 'react'

import {Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ItemReducerActionType, ItemReducerContext, reducer } from './hooks/itemReducer'
import { getItems } from './services/itemService'
import ItemPage from './pages/ItemsPage';
import HomePage from './pages/HomePage';
import { Navbar, NavbarLink } from './components/ui/NavBar';
import ItemDetailsPage from './pages/ItemDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CurrentUserPage from './pages/CurrentUserPage';
import { UserContext } from './hooks/userContext';
import { User } from './types/user';
import {useCookies} from 'react-cookie'
import { isExpired, decodeToken } from "react-jwt";
import { toast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import DocumentsPage from './pages/DocumentsPage';

function App() {

  const [items, itemDispatch] = useReducer(reducer,[]);

  const itemReducerContext = ItemReducerContext;

  const [cookies,, removeCookie] = useCookies(['jwtToken'])

  const [user, setUser] = useState<User|null>(null);

  useEffect(() => {
    getItems()
      .then((res) => {
        itemDispatch({
            type : ItemReducerActionType.SET_ITEMS,
            data : res
        })        
      })
  },[]);

  useEffect(() => {
    if(cookies.jwtToken == null) {
      setUser(null);
    }
    else if (isExpired(cookies.jwtToken)){
      toast({
        variant: 'destructive',
        title: 'Kijelentkeztetve',
        description : 'A bejelentkezés lejárt'
      })
      setUser(null);
      removeCookie('jwtToken');
    }
    else {
      setUser(decodeToken<User>(cookies.jwtToken));
    }
  },[cookies]);

 const navLinks : NavbarLink[] = [
    { path: "/", label: "Home" },
    { path: "/items", label: "Items" },
    { path: "/documents", label: "Documents" },
    { path: "/login", label: "Login", isHidden: user != null},
    { path: "/register", label: "Register", isHidden: user != null},
    { path: "/profile", label: user?.username || "Profile", isHidden: user == null},
  ];


  return (
    <>
      <Toaster/>
      <UserContext.Provider value={{user : user, setUser : setUser}}>
        <itemReducerContext.Provider value={[items, itemDispatch]}>
          <Router>
            <Navbar navlinks={navLinks}/>
            <Routes>
              <Route path="/" Component={HomePage} />
              <Route path="/documents" Component={DocumentsPage} />
              <Route path="/items" Component={ItemPage} />
              <Route path='/item/:id' Component={ItemDetailsPage}/>
              <Route path='/login' Component={LoginPage} />
              <Route path='/register' Component={RegisterPage} />
              <Route path='/profile' element={user ? <CurrentUserPage/> : <Navigate to="/login" replace/>} />
            </Routes>
          </Router>
        
        </itemReducerContext.Provider>
      </UserContext.Provider>
    </>
  )
}

export default App

import { useEffect, useReducer} from 'react'

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ItemReducerActionType, ItemReducerContext, reducer } from './hooks/itemReducer'
import { getItems } from './services/itemService'
import ItemPage from './pages/ItemsPage';
import HomePage from './pages/Homepage';
import { Navbar } from './components/ui/NavBar';
import ItemDetailsPage from './pages/ItemDetailsPage';

function App() {

  const [items, itemDispatch] = useReducer(reducer,[]);

  const itemReducerContext = ItemReducerContext;

  useEffect(() => {
    getItems()
      .then((res) => {
        itemDispatch({
            type : ItemReducerActionType.SET_ITEMS,
            data : res
        })        
      })
  },[]);

 const navLinks = [
    { path: "/", label: "Home" },
    { path: "/items", label: "Items" },
  ];


  return (
    <>
        <itemReducerContext.Provider value={[items, itemDispatch]}>
          <Router>
            <Navbar navlinks={navLinks}/>
            <Routes>
              <Route path="/" Component={HomePage} />
              <Route path="/items" Component={ItemPage} />
              <Route path='/item/:id' Component={ItemDetailsPage}/>
            </Routes>
          </Router>
        
        </itemReducerContext.Provider>
    </>
  )
}

export default App

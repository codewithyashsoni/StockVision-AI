import {useContext} from 'react'
import Button from './Button'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'

const Header = () => {
  const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext)
  const navigate = useNavigate();

  const handleLogout = () =>{
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsLoggedIn(false)
    console.log('Logged out');
    navigate('/login')
  }
  return (
    <>
        <nav className='navbar container pt-3 pb-3 align-items-start'>
            <Link className='navbar-brand text-light' to="/">📈 StockVision AI</Link>

            <div>
              {isLoggedIn ? (
                <>
                <div className="d-flex gap-2">
                  <Button text='Dashboard' class="btn-info" url="/dashboard" />
                  &nbsp;
                  <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
                </div>
                </>
              ) : (
                <>
                <div className="d-flex gap-2">
                  <Button text='Login' class="btn-outline-info" url="/login" />
                  &nbsp;
                  <Button text='Register' class="btn-info" url="/register" />
                </div>
                </>
              )}
                
            </div>
        </nav>
    </>
  )
}

export default Header
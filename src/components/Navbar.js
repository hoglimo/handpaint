import { NavLink } from 'react-router-dom'
import { ReactComponent as Brand } from './logoipsum-269.svg'
import './navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <Brand />
        </div>
        <div className="nav-elements">
          <ul>
            <li>
              <NavLink id="circleNav" to="/">Circle</NavLink>
            </li>
            <li>
              <NavLink id="triangleNav" to="/triangle">Triangle</NavLink>
            </li>
            <li>
              <NavLink id="squareNav" to="/square">Square</NavLink>
            </li>
            <li>
              <NavLink id="rectangleNav" to="/rectangle">Rectangle</NavLink>
            </li>
            <li>
              <NavLink id="pointNav" to="/point">Point</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

//to do: When I Click on a link via Mouse, the shapeObject has to be updated accordingly
//to do: search for a possibility to use the id taken from the shapeObject in the nav to avoid redundancy

export default Navbar


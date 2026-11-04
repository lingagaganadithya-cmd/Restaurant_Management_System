import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }));

  useEffect(() => {
    setAuth({
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
    });
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ token: null, user: null });
    navigate('/');
  };

  const { token, user } = auth;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-mark">F</span>
          FlavorNest
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/menu">Menu</NavLink></li>
            {user?.role === 'user' && <li className="nav-item"><NavLink className="nav-link" to="/dashboard">Dashboard</NavLink></li>}
            {token && <li className="nav-item"><NavLink className="nav-link" to="/my-orders">My Orders</NavLink></li>}
            {user?.role === 'admin' && <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin Dashboard</NavLink></li>}
          </ul>

          <div className="nav-actions d-flex align-items-center gap-3">
            <NavLink className="cart-link" to="/cart">
              <i className="bi bi-cart3" /> Cart
            </NavLink>

            {!token ? (
              <>
                <NavLink className="btn btn-light btn-sm" to="/login">Login</NavLink>
                <NavLink className="btn btn-outline-light btn-sm" to="/register">Register</NavLink>
              </>
            ) : (
              <>
                <NavLink className="nav-account-link" to="/profile">
                  <i className="bi bi-person-circle" /> {user?.name || 'My account'}
                </NavLink>
                <button className="btn btn-outline-light btn-sm nav-logout" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

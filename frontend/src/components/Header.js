import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import "../styled/Header.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Header = () => {
  const [products, setProducts] = useState([]);
  const [islogin, setLogin] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const loginOrnot = async (event) => {
    event.preventDefault();
    setLogin(true)
    try {
      const response = await axios.get("http://localhost:8000/api/login", {
      });
      window.localStorage.setItem('token', response.data)
      const token = localStorage.getItem('token');
      navigate("/")
    } catch {
      setLogin(false)
    }
  }

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/getProducts?category=all", {
      });

      console.log(response.error)
      if (response.status === 200) {
        setProducts(response.data);
        setLoading(false);
      }
      else {
        console.log("something went wrong");
      }
    }
    catch {
      console.log("catch");
    }
  }

  useEffect(() => {
    loadProducts();
    const type = window.localStorage.getItem("type", "")
    setIsAdmin(type === "product" || type === "sales")
  }, []);

  const logout = (event) => {
    event.preventDefault()
    localStorage.removeItem('token');
    localStorage.removeItem('type');
    setLogin(false);

    if (window.location.pathname === "/") {
      window.location.reload()
    }
    navigate("/");
  };

  useEffect(() => {
    loginOrnot();
  }, []);

  const uniqueCategories = [...new Set(products.map(product => product.category))];


  return (
    <div className="header">
      <HomeLink to={"/"}><h1>PEAR.</h1></HomeLink>
      <nav className='right-nav'>
        <ul>
          {localStorage.getItem('token') ? (
            <ul className="menu">
              <li> <Link to={"/cart"}><FontAwesomeIcon icon={faShoppingCart} /> Shopping cart</Link></li>
              <li> <Link to={"/profile"}> <FontAwesomeIcon icon={faUser} /> Profile</Link></li>
              <li>      <Link to={"/wishlist"} > Your Wishlist</Link></li>
               <li> <Link to={"/orders"}> Orders</Link></li>
              {isAdmin ? <li><Link to={"/admin"}>Admin</Link></li> : <></>}
              <li> <Link onClick={logout}>Logout</Link></li> 
            </ul>
          ) : (
            <li> <Link to={"/login"}><FontAwesomeIcon icon={faUser} /> Login </Link></li>

          )}


        </ul>

      </nav>

      <nav>
        <ul >

          {uniqueCategories.map((cat) => (
            <Link to={`/products/${cat}`}>
              <h3 className='product-details' style={{ color: 'white' }}> {cat.toUpperCase()} </h3>
            </Link>

          ))}

        </ul>

      </nav>

    </div>
  );
};


const HomeLink = styled(Link)`
text-decoration: none;
color: black;`

const AdminLink = styled(Link)`
  color: black;
  display: block;
  text-align: right;
  padding: 4px;
`
export default Header;
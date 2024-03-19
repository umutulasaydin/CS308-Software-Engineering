import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styled/MainPage.css';
import styled from "styled-components";
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const Wishlist = () =>{
  var token = window.localStorage.getItem('token');
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const { customerId } = useParams();
    const getWishlistProduct = async () =>{
      try {

        const response = await axios.get(`http://localhost:8000/api/getWishlist`,
        {
          headers: {
              Authorization: `Bearer ${token}`,
          }
      });
        if (response.status === 200) {
          setWishlistProducts(response.data);
        } else {
          console.log("Something went wrong");
        }
      } catch {
        console.log("catch");
      }
    }

    useEffect(() => {
        getWishlistProduct();
      }, []);
    
      return(
      
        
        <div className="product-list">
           
           {wishlistProducts.map((product) => (
       

       <div className="product-card" >
       <Link to={`/product/${product[4]}`}>
         <img className="product-image" src={product[3]} alt={`${product[0]}`} />
       </Link>

       <div className="product-details">
         <h2>{product[0]}</h2>
         
         </div>
        </div>
      ))}
   
        </div>


      );
};
export default Wishlist;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styled/ProductPage.css';
import CommentList from '../components/CommentList';
//import ProductComments from './ProductComments';
//import AddToWishlist from './AddToWishlist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import Heart from "react-animated-heart";


const ProductPage = () => {
  var token = window.localStorage.getItem('token')

  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  //const [wishlist, setWishlist] = useState(false);
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isClick, setClick] = useState(false);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/products/${productId}`);
      if (response.status === 200) {
        setProduct(response.data);
        setClick(response.data.wishlist_ids.length > 0);

      } else {
        console.log("something went wrong");
      }
    } catch {
      console.log("catch");
    }
  }

  useEffect(() => {
    loadProduct();
  }, []);

  const AddToCart = async (product) => {
    if (token === null) {
      let cart = JSON.parse(window.localStorage.getItem("cart")) || [];
      cart.push({ "item": product.id, "qty": 1 });
      window.localStorage.setItem("cart", JSON.stringify(cart));
      console.log("Product added to local cart");
    } else {
      try {
        const config = { headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } }
        const response = await axios.post("http://localhost:8000/api/addToCart", { productId: product.id }, config);
        if (response.status === 200) {
          console.log("Product added to the database cart");
        } else {
          console.log("Something went wrong");
        }
      } catch {
        console.log("catch");
      }
    }
    navigate("/cart")
  };


  const AddToWishlist = async (product) => {
    if (token === null) {
      let wishlist = JSON.parse(window.localStorage.getItem("wishlist")) || [];
      wishlist.push({ "item": product.id, "qty": 1 });
      window.localStorage.setItem("wishlist", JSON.stringify(wishlist));
      console.log("Product added to local wishlist");
    } else {
      try {
        const config = { headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } }
        const response = await axios.post("http://localhost:8000/api/addCustomertoProductWishlist", { productId: product.id }, config);


        if (response.status === 200) {
          console.log("Customer added to the database wishlist");
        } else {
          console.log("Something went wrong");
        }
      } catch {
        console.log("catch");
      }
      try {
        const config = { headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } }
        const response = await axios.post("http://localhost:8000/api/addWishlist", { productId: product.id }, config);


        if (response.status === 200) {
          console.log("Product added to the database wishlist");
        } else {
          console.log("Something went wrong");
        }
      } catch {
        console.log("catch");
      }


    }

  };


  return (
    <div className="product-page">
      {product ? (
        <>
          <div className="pd-image">
            {product.discount > 0 && (
              <div className="discount">{product.discount}% off</div>
            )}
            <img src={product.image} alt={product.name} />
          </div>
          <div className="pd-details">
            <div className="pd-name">{product.name}</div>
            <div className="pd-brand">{product.brand}</div>
            <div className="pd-desc">Model: {product.model}</div>
            <div className="pd-desc">{product.description}</div>
            <div className="pd-desc">Distributor: {product.distributer}</div>
            <div className='pd-warranty'>Warranty status: {product.warranty} year(s)</div>
            <div className="pd-rating">Rating: {product.rating[1].toFixed(2)} ({product.rating[0]} ratings)</div>
            <div className="pd-desc">Stock: {product.stock}</div>
            <div className="pd-price">
              {product.discount > 0 ? (
                <>
                  <div className="discount">{product.discount}% off</div>
                  <div className="pd-new-price">
                    {product.price - (product.price * product.discount) / 100} TL
                  </div>
                  <div className="pd-old-price">{product.price} TL</div>
                </>
              ) : (
                <p className="pd-price">{product.price} TL</p>
              )}
            </div>
            {product.stock > 0 ? (
              <button className="add-to-cart" onClick={() => AddToCart(product)}>Add to Cart</button>
            ) : (
              <div className="out-of-stock">Out of Stock</div>
            )}
            <div >

              <Heart isClick={isClick} onClick={() => {
                AddToWishlist(product);
                setClick(!isClick);
              }} />

            </div>
            <div className="pd-price">Comments:</div>

            <CommentList prod_id={productId} token={token}></CommentList>

          </div>
        </>
      ) : (
        <p>Loading...</p>


      )}

    </div>
  );
};

export default ProductPage;

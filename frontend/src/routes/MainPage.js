import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styled/MainPage.css';
import axios from 'axios';
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchBox = styled.input`
  width: 50%;
  height: 2.5rem;
  padding: 0.5rem;
  border: 1px solid gray;
  border-radius: 0.25rem;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

function MainPage() {
  var token = window.localStorage.getItem('token')
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMethod, setSortMethod] = useState('');
  const { category } = useParams();
  const navigate = useNavigate();

  const sortProducts = (method, productsToSort) => {
    const sortedProducts = [...productsToSort];
    switch (method) {
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        sortedProducts.sort((a, b) => b.rating[1] - a.rating[1]);
        break;
      case 'alphabetical':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sortedProducts;
  };

  const sortedProducts = sortProducts(sortMethod, products);

  const filteredProducts = sortedProducts.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSortChange = (event) => {
    setSortMethod(event.target.value);
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/getProducts?category=${category !== undefined ? category : "all"}`);
        if (response.status === 200) {
          setProducts(response.data.filter(p => !p.deleted));
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

    loadProducts();
  }, [category]);

  /*const getProductCountInCart = (product) => {
    let cart = JSON.parse(window.localStorage.getItem("cart")) || [];
    return cart.filter((item) => item.id === product.id).length;
  };*/

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


  return (
    <div className="MainPage">
      <Container>
        <SearchBox

          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search products"
        />
        <select onChange={handleSortChange}>
          <option value="">Sort by...</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="popularity">Popularity</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </Container>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-list">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/product/${product.id}`}>
                <img className="product-image" src={product.image} alt={`${product.name}`} />
              </Link>

              <div className="product-details">
                <h2>{product.name}</h2>
                <h3>{product.brand}</h3>
                {product.discount > 0 ? (
                  <>
                    <div className="discount">{product.discount}% off</div>
                    <div className="old-price">{product.price} TL</div>
                    <p className="product-price">
                      {product.price - (product.price * product.discount) / 100} TL
                    </p>
                  </>
                ) : (
                  <p className="product-price">{product.price} TL</p>
                )}
                {product.stock > 0 ? (
                  //getProductCountInCart(product) < product.stock ? (
                  <button onClick={() => AddToCart(product)}>Add to Cart</button>
                  // ) : (
                  //<p>Maximum Quantity in Cart</p>
                  //)
                ) : (
                  <div className='out-of-stock'>Out of Stock</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}



    </div>
  );
}

export default MainPage;
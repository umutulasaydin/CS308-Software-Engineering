import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
`;

const PriceInput = styled.input`
  width: 40%;
  height: 2rem;
  padding: 0.5rem;
  border: 1px solid gray;
  border-radius: 0.25rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
`;

const DiscountInput = styled(PriceInput)``;

const ChangeButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 0rem 0rem;
  margin: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

function PricesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tempPrice, setTempPrice] = useState({});
  const [tempDiscount, setTempDiscount] = useState({});
  const { category } = useParams();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/getProducts?category=${category !== undefined ? category : "all"}`);
        if (response.status === 200) {
          setProducts(response.data);
          setLoading(false);
        } else {
          console.log("Something went wrong");
        }
      } catch {
        console.log("Catch");
      }
    };
    loadProducts();
  }, [category]);

  const handlePriceChange = (id, price) => {
    setTempPrice({ ...tempPrice, [id]: price });
  };

  const handleDiscountChange = (id, discount) => {
    setTempDiscount({ ...tempDiscount, [id]: discount });
  };

  const updatePrice = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/updateProduct/${id}`, {
        price: parseInt(tempPrice[id]),
      });

      if (response.status === 200) {
        setProducts(
          products.map((product) =>
            product.id === id ? { ...product, price: tempPrice[id] } : product
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateDiscount = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/updateProduct/${id}`, {
        discount: parseInt(tempDiscount[id]),
      });
  
      if (response.status === 200) {
        const updatedProduct = products.find((product) => product.id === id);
        updatedProduct.discount = tempDiscount[id];
  
        if (tempDiscount[id] > 0 && updatedProduct.wishlist_ids.length > 0) {
          console.log(updatedProduct.wishlist_ids);
          const customerIds = updatedProduct.wishlist_ids;
          notifyWishlistCustomers(customerIds, updatedProduct);
        }
  
        setProducts(
          products.map((product) =>
            product.id === id ? updatedProduct : product
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const notifyWishlistCustomers = async (customerIds, product) => {
    try {
      const response = await axios.post(`http://localhost:8000/api/notifyWishlistCustomers`, {
        customerIds,
        product
      });
  
      if (response.status !== 200) {
        console.error('Something went wrong while sending emails to customers');
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <Container>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/product/${product.id}`}>
              <img className="product-image" src={product.image} alt={`${product.name}`} />
              </Link>

              <div className="product-details">
                <h2>{product.name}</h2>
                <h3>{product.brand}</h3>

                <PriceInput
                  type="number"
                  value={tempPrice[product.id] || product.price}
                  onChange={(event) => handlePriceChange(product.id, event.target.value)}
                />
                <ChangeButton onClick={() => updatePrice(product.id)}>
                  Change Price
                </ChangeButton>

                <DiscountInput
                  type="number"
                  value={tempDiscount[product.id] || product.discount}
                  onChange={(event) => handleDiscountChange(product.id, event.target.value)}
                />
                <ChangeButton onClick={() => updateDiscount(product.id)}>
                  Change Discount
                </ChangeButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default PricesPage;
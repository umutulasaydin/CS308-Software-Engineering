import React, { useEffect, useState } from 'react';
import { ShoppingCartView } from '../styled/ShoppingCart';
import { CartTotal } from '../styled/CartTotal';
import { CartPageContainer } from '../styled/CartPageContainer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ShoppingCart() {
  var token = window.localStorage.getItem('token')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadItems = async () => {
    setLoading(true);
    try {
      if (token === null) {
        if (window.localStorage.getItem('cart') !== null) {
          const cart = JSON.parse(window.localStorage.getItem("cart"))
          const response = await axios.post("http://localhost:8000/api/getitems", { cart })

          setItems(response.data);
        }
        setLoading(false);
      }
      else {
        //not logged in
        if (window.localStorage.getItem("cart")) {
          var localCart = JSON.parse(window.localStorage.getItem("cart"));
          const response = await axios.post("http://localhost:8000/api/mergeLocalCart",
            { "cart": localCart },
            {
              headers:
              {
                Authorization: `Bearer ${token}`
              }
            })
          if (response.status === 200) {
            console.log("merging local cart with db is completed");
          }
          window.localStorage.removeItem("cart");
          loadItems();
        }
        const response = await axios.get("http://localhost:8000/api/getitems", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setItems(response.data);
          setLoading(false);
        }
        else {
          console.log("something went wrong");
        }
      }
    } catch {
      console.log("catch");
    }
  }

  useEffect(() => {
    loadItems();
  }, [])

  // function to remove an item from the cart
  async function removeItem(id) {
    const newItems = items.filter(item => item.id !== id);
    if (token) {
      const response = await axios.post("http://localhost:8000/api/removeFromCart", {
        "product_id": id,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
    }
    else {
      //not logged in
      var localCart = JSON.parse(window.localStorage.getItem("cart"));

      localCart = localCart.filter(item => item["item"] !== id);
      console.log("local:", localCart)
      if (localCart.length == 0) {
        window.localStorage.removeItem("cart");
      }
      else {
        window.localStorage.setItem("cart", JSON.stringify(localCart));
      }
    }
    setItems(newItems);
  }

  async function decreaseAmount(id) {

    const item = items.find(item => item.id === id);
    if (item.qty === 1) {
      alert("you cannot reduce amount, try removing the item")
      return
    }
    item.qty = item.qty - 1
    if (token) {
      const response = await axios.post("http://localhost:8000/api/changeAmount", {
        "product_id": id,
        "qty": item.qty,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
      console.log(response)
    } else {
      const cart = JSON.parse(window.localStorage.getItem("cart"))
      cart.forEach(item => {
        if (item.item === id) {
          item.qty--
        }
      })
      window.localStorage.setItem("cart", JSON.stringify(cart))
        ;
    }
    loadItems();
  }

  async function increaseAmount(id) {
    const item = items.find(item => item.id === id);
    if (item.qty < item.stock) {
      item.qty = item.qty + 1
      if (token) {
        const response = await axios.post("http://localhost:8000/api/changeAmount", {
          "product_id": id,
          "qty": item.qty,
        },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
        console.log(response)
      } else {
        const cart = JSON.parse(window.localStorage.getItem("cart"))

        cart.forEach(item => {

          if (item.item === id) {
            item.qty = item.qty + 1
          }
        });

        window.localStorage.setItem("cart", JSON.stringify(cart))
      }
      loadItems();
    }
    else {
      alert("You cannot add more item, no more item left in stock.")
    }
  }

  const clearCart = async () => {
    setItems([]);
    if (token) {
      const response = await axios.post("http://localhost:8000/api/clearCart",
        {},
        {
          headers:
          {
            Authorization: `Bearer ${token}`,
          }
        })

      if (response.status === 200) {
        console.log("successfully cleared the cart");
      }
      else {
        console.log("problem in clearing the cart");
      }
    }
    else {
      // not logged in, remove from local
      if (window.localStorage.getItem('cart') !== null) {
        window.localStorage.removeItem("cart");
      }
    }
  }

  // calculate total price of items in cart
  const totalPrice = items === null ? 0 : items.reduce((acc, item) => {
    return acc + item.price * item.qty * (100 - item.discount) * 0.01;
  }, 0);

  const handleCheckout = (event) => {
    event.preventDefault();
    if (token === null) {
      const answer = window.confirm("You need to log in to continue checkout. Do you want to proceed?")
      if (answer)
        navigate("/login")
    }
    else {
      navigate("/checkout")
    }
  };

  return (
    <CartPageContainer>
      <ShoppingCartView>
        <div className="shopping-cart">
          <h1>Shopping Cart</h1>
          <ul>
            {loading === true ? <span>
              LOADING ...
            </span> :
              items.length === 0 ? <div className='empty-list'><h2>Your shopping cart is empty.</h2></div> :

                items.map(item => (
                  <li key={item.id}>

                    <div className="list-item">
                      <img src={item.image} alt={item.title} />
                      <div className="list-item-body">
                        <h2 className="list-item-title">{item.name}</h2>
                        <p className="list-item-text">{item.description}</p>
                        <p className="list-item-price">${(item.price * item.qty * (100 - item.discount) * 0.01).toFixed(2)}</p>
                        <div className='btn-group-2'>
                          <button className="btn" onClick={() => removeItem(item.id)}>Remove</button>
                          <button className="btn" onClick={() => decreaseAmount(item.id)}>-</button>
                          <p className="list-item-amount">{item.qty}</p>
                          <button className="btn" onClick={() => increaseAmount(item.id)}>+</button>
                        </div>
                      </div>
                    </div>

                  </li>
                ))}
          </ul>
        </div>
      </ShoppingCartView>
      <CartTotal>
        <div className="total-price">
          <h2>Total Price: ${totalPrice.toFixed(2)}</h2>
          <hr></hr>
          <div className='btn-group'>
            <button className="btn" onClick={() => clearCart()}>Clear Cart</button>
            <button className="btn" onClick={handleCheckout} >Checkout</button>
          </div>
        </div>
      </CartTotal>
    </CartPageContainer>
  );
}

export default ShoppingCart;
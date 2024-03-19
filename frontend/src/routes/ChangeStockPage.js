import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link, useParams } from 'react-router-dom';




function ChangeStockPage() {
    var token = window.localStorage.getItem('token')
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { category } = useParams();

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/getProducts?category=${category !== undefined ? category : "all"}`, {
            });
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
    }, [category]);


    const changeStock = async (item) => {
        var newStock = window.prompt("Please enter the new stock");
        if (newStock === null || newStock === "") {
        }
        else {
            newStock = +newStock
            if (isNaN(newStock)) {
                window.alert("stock value must be number")
            }
            else if (newStock < 0) {
                window.alert("stock value must be greater than 0")
            }
            else {

                const response = await axios.post("http://localhost:8000/api/changeStock",
                    {
                        "product_id": item.id,
                        "new_stock": newStock
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });


                if (response.status === 200) {
                    console.log("succesfully changed stock")
                    loadProducts();
                }
                else {
                    alert("stock change failed")
                }
            }
        }

    };

    return (
        <ListView>
            <div className="shopping-cart">
                <ul>
                    {loading === true ? <span>
                        LOADING ...
                    </span> :
                        products.length === 0 ? <div className='empty-list'><h2>No items found</h2></div> :

                            products.map((item) => (
                                <li key={item.id}>

                                    <div className="list-item">
                                        <img src={item.image} alt={item.title} />
                                        <div className="list-item-body">
                                            <h2 className="list-item-title">{item.name}</h2>
                                            <p className="list-item-text">{item.description}</p>
                                            <p className="list-item-price">${(item.price * (100 - item.discount) * 0.01).toFixed(2)}</p>
                                            <div className='btn-group'>
                                                <button type="submit" onClick={() => changeStock(item)}>Change Stock </button>
                                                <p className="list-item-amount">Stock: {item.stock}</p>
                                            </div>
                                        </div>
                                    </div>

                                </li>
                            ))}
                </ul>
            </div>
        </ListView>
    )
}

export default ChangeStockPage;

const StockGroup = styled.div`
    display: flex;
    padding: 5px;
    justify-content: space-evenly;
`

const ListView = styled.div`
display: flex;
flex: 4;
align-items: stretch;

img {
    width: 100px;
}
h1 {
  text-align: left;
  margin: 20px;
}

ul {
  padding: 0 20px 0 20px;
  list-style-type: none;
}

ul span {
  font-size: 30px;
}

.shopping-cart {
  width: 100%;
}

.empty-list {
  margin-top: 40px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid black;
}

.list-item img {
  max-width: 250px;
  max-height: 180px;
}

.list-item-body {
  margin-left: 20px;
}

.total-price h2 {
    margin: 10px 10px 10px 10px;
    color: red;
}

.list-item-amount {
  font-weight: bold;
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 20px;
}

button {
    background-color: #3f51b5;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;

    width: 150px;
    max-width: 250px;
    height: 30px;

    &:hover {
      background-color: #2c3e50;
    }
  }

  .btn-group {
    display: flex;
    flex-direction: row;
}

 form{
    display: flex;
    input {
        border-radius: 5px;
        height: 30px;
        text-align: center;
        margin-top: auto;
        margin-bottom: auto;
    }
    button {
        margin-top: auto;
        margin-bottom: auto;
        margin-left: 20px;
    }
 }


`
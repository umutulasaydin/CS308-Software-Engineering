import React, { useEffect, useState } from 'react';
import Card from "../components/OrderCart"
import axios from 'axios';

function OrdersPage(){
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const array = [];
    const loadOrders = async () => {
        setLoading(true);
        try {
            const token = `Bearer ${window.localStorage.getItem("token")}`
            const config = { headers: { Authorization: token } }
            const response = await axios.get("http://localhost:8000/api/get_orders", config);
            console.log(response.error)
            if (response.status === 200) {
                if (array.length == 0)
                {
                    for (let i = 0; i < response.data[0].length; i++){
                        var data = response.data[0][i]
                        array.push(
                            {"id": data[0],
                            "products": data[1],
                            "address": data[2],
                            "date": new Date(data[3]).toLocaleString(),
                            "price": data[4],
                            "delivery" : data[5],
                            "phone_number": data[6],
                            "_id" : data[7]
                        });
                    }
                }
            console.log(array);
              setOrders(array);
              setLoading(false);
              
              
            } else {
              console.log("something went wrong");
            }
          } catch {
            console.log("catch");
          }
    }

    useEffect(() => {
        loadOrders();
      }, []);

  
   

      return (
        <div>
            <h2 style={{margin: "20px"}}>Orders</h2>
            {orders.map(item => <Card key = {item._id} props = {item} />)}
        </div>
      )
}

export default OrdersPage;
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import "../styled/Orders.css";
import Button from '@mui/material/Button';
const Refund = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const array = [];
    const loadOrders = async () => {
        setLoading(true);
        try {
            
            const response = await axios.get("http://localhost:8000/api/getRefunds");
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
                            "_id" : data[7],
                            "customer":data[8]
                        });
                    }
                }
           
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
            <h2>Orders</h2>
            {orders.map(item => <Card key = {item._id} props = {item} />)}
        </div>
      )
}

function Card({props}) {
    var items = [];
    for (let i = 0; i < props.products.length; i++){
        var data = props.products[i];
        items.push(
            {
                "price": data[0],
                "qty" : data[1],
                "comment" : data[2],
                "rated" : data[3],
                "refund" : data[4],
                "name" : data[5],
                "image" : data[6],
                "id" : data[7],
                "date" : props.date,
                "delivery" : props.delivery,
                "order_id" : props.id,
                "_id" : props._id
            }
        )
    }
    
    
    
      return (
        <div className='card'>
            <h4>Order No: {props.id}</h4>
            <h4>Customer Id: {props.customer}</h4>
            <h4>Address: {props.address}</h4>
            <h4>Purchase Date: {props.date}</h4>
            <h4>Delivery Status: {props.delivery}</h4>
            <h4>Phone Number: {props.phone_number}</h4>
            {items.map(item => <Product key={item} props = {item} />)}
        </div>
      )
}

function Product({ props }) {
    const [refund, setRefund] = React.useState("");
    return (
        <div className='product'>
            <h4>Product Id: {props._id}</h4>
            <h4>Product Name: {props.name}</h4>
            <h4>Quantity: {props.qty}</h4>
            <h4>Purchase Price: {props.price}</h4>
            <img className="product-image" src={props.image} />  
            <h4>Refund Status: {props.refund}</h4>
            {(props.refund === "Requested") && <Button
                variant="contained"
                onClick={ async (value) => {
                    try {
                        
                    setRefund("Accepted");
                    props.refund = "Accepted";
                    var ref = "Accepted";
                    var id = props.id;
                    var order_id = props._id;
                    const response = await axios.post("http://localhost:8000/api/changeRefundSta", {ref, id, order_id});
                        console.log(response.error)
                        if (response.status === 200) {
                            console.log("Okay");
                                   
                        } else {
                            console.log("something went wrong");
                        }
                    } catch {
                        console.log("catch");
                    }

                }}>Accept</Button>}
                
                {(props.refund === "Requested") && <Button
                variant="contained"
                onClick={ async (value) => {
                    try {
                        setRefund("Declined");
                    props.refund = "Declined";
                    var ref = "Declined";
                    var id = props.id;
                    var order_id = props._id;
                    const response = await axios.post("http://localhost:8000/api/changeRefundSta", {ref, id, order_id});
                        console.log(response.error)
                        if (response.status === 200) {
                            console.log("Okay");
                                   
                        } else {
                            console.log("something went wrong");
                        }
                    } catch {
                        console.log("catch");
                    }

                }}>Decline</Button>}
                     
        </div>
    )

}


export default Refund

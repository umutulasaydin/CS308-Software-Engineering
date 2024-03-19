import React, { useEffect, useState } from 'react';
import "../styled/Orders.css";
import Product from "../components/OrderProduct";
import Button from '@mui/material/Button';
import axios from 'axios';

function Card({ props }) {
    var items = [];
    const [cancel, setCancel] = React.useState("");
    for (let i = 0; i < props.products.length; i++) {
        var data = props.products[i];
        items.push(
            {
                "price": data[0],
                "qty": data[1],
                "comment": data[2],
                "rated": data[3],
                "refund": data[4],
                "name": data[5],
                "image": data[6],
                "id": data[7],
                "date": props.date,
                "delivery": props.delivery,
                "order_id": props.id,
                "_id": props._id
            }
        )
    }




    return (
        <div className='card'>
            <div className='prod_desc'>
                <h4>Order No: {props.id}</h4>
                <h4>Address: {props.address}</h4>
                <h4>Purchase Date: {props.date}</h4>
                <h4>Delivery Status: {props.delivery}</h4>
                <h4>Phone Number: {props.phone_number}</h4>
                {props.delivery === "Processing" && <Button
                    className='btn'
                    variant="contained"
                    onClick={async () => {
                        setCancel("Canceled");
                        var order_id = props._id;
                        const response = await axios.post("http://localhost:8000/api/deleteOrder", { order_id });
                        if (response.status === 200) {
                            console.log("Okay");
                            window.location.reload(false);

                        } else {
                            console.log("something went wrong");
                        }
                    
                    }}>Cancel</Button>}
            </div>
            <div className='prod_items'>
                {items.map(item => <Product key={item} props={item} />)}

            </div>

        </div>
    )
}



export default Card;


import React, { useEffect } from 'react';
import "../styled/Orders.css"
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import axios from 'axios';





export default function Product({ props }) {

    const [value, setValue] = React.useState(2);
    const [comment, setComment] = React.useState("");
    const [refund, setRefund] = React.useState("");
    




    return (
        <div className='product'>
            <h4>Product Name: {props.name}</h4>
            <h4>Quantity: {props.qty}</h4>
            <h4>Purchase Price: {props.price}</h4>
            <img className="product-image-1" src={props.image} />
            <div className='comment'>
            {(props.delivery === "Delivered" && props.comment === false) && <h4> Comment</h4>}
            <div className='commentInput'>
            {(props.delivery === "Delivered" && props.comment === false)&& <textarea id="area" rows="5" cols="33" className='txtArea'></textarea>}
            {(props.delivery === "Delivered" && props.comment === false) && <Button
                variant="contained"
                className='btn'
                onClick={ async () => {
                    var value2 = document.getElementById("area").value;
                    setComment(value2);
                    props.comment = true;
                    try {
                        var id = props.id;
                        var order_id = props._id;
                        const token = `Bearer ${window.localStorage.getItem("token")}`
                        const config = { headers: { Authorization: token } }
                        value2 = document.getElementById("area").value;
                        var date = new Date()
                        const response = await axios.post("http://localhost:8000/api/comment", {value2, id, order_id, date}, config);
                        console.log(response.error)
                        if (response.status === 200) {
                            console.log("Okay");
                                   
                        } else {
                            console.log("something went wrong");
                        }
                    } catch {
                        console.log("catch");
                    }

                }}>Submit</Button>}
                </div>
                </div>

            {props.comment === true && <h4> This product has been reviewed.</h4>}
            <br></br>
            {(props.delivery === "Delivered" && props.rated === false) && <h4> Rate </h4>}
            {(props.delivery === "Delivered" && props.rated === false) && <Rating
                name="simple-controlled"
                value={value}
                onChange={async (event, newValue) => {
                    setValue(newValue);
                    props.rated = true;
                    try {
                        var id = props.id;
                        var order_id = props._id;
                        
                        const response = await axios.post("http://localhost:8000/api/rate", {newValue, id, order_id});
                        console.log(response.error)
                        if (response.status === 200) {
                            console.log("Okay");
                            
                            
                        } else {
                            console.log("something went wrong");
                        }
                    } catch {
                        console.log("catch");
                    }
                }}
            />}
            {props.rated === true && <h4> This product is rated.</h4>}


            <br></br>
            {(((new Date() - new Date(props.date)) / (1000.0 * 60.0 * 60.0 * 24.0)) <= 30 && props.refund === "None" && props.delivery === "Delivered") && <Button
                variant="contained"
                onClick={async() => {
                    setRefund("Requested");
                    props.refund = "Requested";
                    var ref = "Requested";
                    var id = props.id;
                    var order_id = props._id;
                    const response = await axios.post("http://localhost:8000/api/changeRefundSta", {ref, id, order_id});
                    console.log(response.error)
                        if (response.status === 200) {
                            console.log("Okay");
                        } else {
                            console.log("something went wrong");
                        }
                 
                }}>Refund</Button>}
            
            {props.refund !== "None" && <h4>Refund Status: {props.refund}</h4>}
            
        </div>
    )
}
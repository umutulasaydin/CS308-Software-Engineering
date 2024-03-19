import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const CommentList = ({ prod_id, token }) => {
    const [comments, setComments] = useState([]);
    const [userType, setUserType] = useState([]);

    const CartItem = ({ item }) => {

        return (
            <div>
                {item.status === "true" ?
                    <CartItemDiv>
                        <span>{item.comment} </span>
                        <span>{item.date}</span>
                    </CartItemDiv>
                    :
                    <></>
                }
            </div>
        )
    }

    const getComments = async (prod_id) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/getComments/${prod_id}`)
            if (response.status === 200) {
                setComments(response.data);
            }
            else {
                console.log("something went wrong");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getUserType = async (token) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/getUserType`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
            if (response.status === 200) {
                setUserType(response.data);
            }
            else {
                console.log("something went wrong");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const declineComment = async (item) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/declineComment`,
                {
                    "comment_id": item["_id"]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
            if (response.status === 200) {
                console.log("decline comment response:", response.data)
                getComments(item["product_id"]);
            }
            else {
                console.log("something went wrong");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const approveComment = async (item) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/approveComment`,
                {
                    "comment_id": item["_id"]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
            if (response.status === 200) {
                console.log("approve response:", response.data)
                getComments(item["product_id"]);
            }
            else {
                console.log("something went wrong");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getComments(prod_id);
        getUserType(token);
    }, [])

    return (

        <Div>
            {comments.map((item) => (
                <CartItem key={item["_id"]} item={item} />
            ))}
        </Div>
    )



}

const Div = styled.div`
    padding: 16px;
`

const CartItemDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid black;
    img {
        width: 100px;
        height: 100px;
    }

    .approve-btn {
        background-color: #3f51b5;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 10px;
        width: 100%;
        max-width: 250px;
        margin: 20px 20px;
    
        &:hover {
          background-color: #2c3e50;
        }
      }

      .decline-btn {
        background-color: #881133;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 10px;
        width: 100%;
        max-width: 250px;
        margin: 20px 20px;
    
        &:hover {
          background-color: #2c3e50;
        }
      }
`
export default CommentList;

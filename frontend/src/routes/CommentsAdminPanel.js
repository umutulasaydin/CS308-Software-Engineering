import React, { useState, useEffect } from "react";
import styled from "styled-components";
import spinner from "../assets/ring-resize.svg"
import axios from 'axios';

function CommentsAdminPanel() {
    var token = window.localStorage.getItem('token');
    const [loadingApprove, setLoadingApprove] = useState(false);
    const [loadingDecline, setLoadingDecline] = useState(false);
    const [comments, setComments] = useState([]);


    useEffect(() => {
        getComments();
    }, [])


    const CartItemAdmin = ({ item }) => {

        return (
            <div>
                <CartItemDiv>
                    <img className="product-image" src={item.image} alt={`${item.name}`} />
                    <span>{item.name}</span>
                    <span> <span className="commentBold">Comment:</span> {item.comment} </span>
                    <span>{item.date}</span>
                    <span className="btn-group">
                        <button className="approve-btn" onClick={() => approveComment(item)}>
                            approve
                        </button>
                        <button className="decline-btn" onClick={() => declineComment(item)}>
                            decline
                        </button>
                    </span>
                </CartItemDiv>
            </div>
        )
    };


    const getComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/getApprovalComments`, 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
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

    const declineComment = async (item) => {
        setLoadingDecline(true);
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
        setLoadingDecline(false);
    }

    const approveComment = async (item) => {
        setLoadingApprove(true);
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
        setLoadingApprove(false);
    }

    return (

        <Div>
            {comments.map((item) => (
                <CartItemAdmin key={item["_id"]} item={item} />
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

    .btn-group{
        width: 240px;
    }

    .commentBold{
        font-weight: bold;
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
        max-width: 80px;
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
        max-width: 80px;
        margin: 20px 20px;
    
        &:hover {
          background-color: #2c3e50;
        }
      }
`

export default CommentsAdminPanel;
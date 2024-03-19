import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import check from "../assets/check.svg"
import Invoice from '../components/Invoice';

const OrderSuccessPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const handleButtonClick = () => {
        navigate("/")
    }
    return (
        <OuterDiv>
            <InnerDiv>
                <img src={check} alt="check icon" />
                <h1>Success!</h1>
                <div>Order no: {location.state.order["orderNo"]}</div>
                <div>A copy of your invoice will be sent to your email</div>
                <button onClick={handleButtonClick}>Continue shopping</button>
            </InnerDiv>
            <Invoice order={location.state.order} />
        </OuterDiv>
    )
}

const OuterDiv = styled.div`
    margin-top:40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const InnerDiv = styled.div`
    width:30vw;
    height: 40vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content: center;

    
    div {
        margin-bottom: 10px;
    }

    button {
        margin: 6px;
        font-size: 16px;
        background-color: #3f51b5;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        width: 200px;
        height:40px;
        margin: 10px 0px;
        &:hover {
            background-color: #2c3e50;
        }
    }
    
    h1 {
        font-size: 32px;
        color: #26a269;
    }


`
export default OrderSuccessPage
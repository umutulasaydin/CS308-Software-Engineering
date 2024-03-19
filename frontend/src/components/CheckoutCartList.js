import React from 'react'
import styled from 'styled-components'

const CheckoutCartList = ({ cartItems }) => {
    return (
        <Div>
            <span>Your cart:</span>
            <table>
                <colgroup>
                    <col style={{ width: "70%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <CartItem key={item.name} item={item} />
                    ))}
                </tbody>
            </table>

        </Div>
    )
}

const CartItem = ({ item }) => {
    return (
        <tr>
            <td>
                <div className='item'>
                    <img src={item.image} alt='item' />
                    <span className='itemName'>{item.name}</span>
                </div>
            </td>
            <td>{item.qty}</td>
            <td>${item.price * item.qty * (100 - item.discount) * 0.01}</td>
        </tr>
    )
}

const Div = styled.div`
    padding: 16px;
    width: 100%;
    margin-left: 16px;
    
    table {
        width:80%;
        margin-top: 20px;
    }
    img {
        display: inline-block;
        width:100px;
    }

    th {
        text-align:left;
    }

    td {
        border-top: 1px solid black;
    }
    
    .item {
        display: flex;
        flex-direction:row;
    }
    .itemName {
        display: flex;
        height:100px;
        align-items: center;
    }
`

export default CheckoutCartList
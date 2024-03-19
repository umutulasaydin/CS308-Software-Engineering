import axios from 'axios'
import React, { useEffect, useState } from 'react'
import AddressSelection from '../components/AddressSelection'
import CardInput from '../components/CardForm'
import CheckoutCartList from '../components/CheckoutCartList'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import MailInvoice from '../components/MailInvoice'
import blobToBase64 from '../utils/blobToBase64'
import spinner from "../assets/ring-resize.svg"

const PaymentPage = () => {
    const navigate = useNavigate()
    const [cardFormFull, setCardFormFull] = useState(false)
    const [addresses, setAddresses] = useState([])
    const [currentAddress, setCurrentAddress] = useState(0)
    const [cartItems, setCartItems] = useState([])
    const [showCardMsg, setShowCardMsg] = useState(false)
    const [loading, setLoading] = useState(false)
    const [card, setCard] = useState({
        "name": "",
        "number": "",
        "month": "01",
        "year": "2023",
        "cvc": ""
    })

    useEffect(() => {
        const a = card.number.length === 19
        const b = card.name !== ""
        const c = card.cvc.length === 3
        setCardFormFull(a && b && c)
    }, [card])

    useEffect(() => {
        const fetchUser = async () => {
            const token = `Bearer ${window.localStorage.getItem("token")}`
            const config = { headers: { Authorization: token } }
            setAddresses((await axios.get("http://localhost:8000/api/addresses_all", config)).data)
            setCartItems((await axios.get("http://localhost:8000/api/getitems", config)).data)
        }
        try {
            fetchUser()
        } catch (error) {
            console.log(error)
        }
    }, [])

    const handleOrderClick = async () => {
        if (cardFormFull === true) {
            setLoading(true)
            const data = {
                "products": cartItems.map((item) => { return { itemId: item.id, price: item.price, qty: item.qty, cost: item.cost } }),
                "address": addresses[currentAddress].id,
                "date": new Date(),
                "price": cartItems.reduce((total, currentItem) => {
                    return total + currentItem.price * currentItem.qty * (100 - currentItem.discount) * 0.01
                }, 0) + 9.99,
                "cost": cartItems.reduce((total, currentItem) => total + currentItem.cost, 0)
            }

            try {
                const config = { headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } }
                const response = await axios.post("http://localhost:8000/api/order", data, config)

                const pdfDoc = pdf(<MailInvoice order={response.data} />)
                const pdfB64 = await blobToBase64(await (pdfDoc.toBlob()))
                axios.post("http://localhost:8000/api/register-invoice", {
                    pdfB64,
                    order: response.data["id"],
                    email: response.data["customer"]["email"]
                })

                setLoading(false)
                navigate("/success", { state: { order: response.data } })
            } catch (error) {
                console.log(error)
            }
        } else {
            setShowCardMsg(true)
        }


    }
    return (
        <PaymentDiv>
            <div className='left'>
                <AddressSelection addresses={addresses} onChange={setCurrentAddress} setAddresses={setAddresses} />
                <CardInput card={card} setCard={setCard} showMsg={showCardMsg} />
                <CheckoutCartList cartItems={cartItems} />
            </div>
            <div className='right' >
                <PaymentSummary cartItems={cartItems} handleOrder={handleOrderClick} loading={loading} />
            </div>
        </PaymentDiv>

    )
}

const PaymentSummary = ({ cartItems, handleOrder, loading }) => {
    return (
        <PaymentSumDiv>
            <div>
                <span>Items: </span>
                <span>${cartItems.reduce((total, currentItem) => {
                    return total + currentItem.price * currentItem.qty * (100 - currentItem.discount) * 0.01
                }, 0)}</span>

            </div>
            <div>
                <span>Shipping: </span>
                <span>{cartItems.length === 0 ? "$0" : "$9.99"}</span>
            </div>
            <div className='line'></div>
            <div>
                <span>Total: </span>
                <span>${cartItems.length === 0
                    ? 0
                    : cartItems.reduce((total, currentItem) => {
                        return total + currentItem.price * currentItem.qty * (100 - currentItem.discount) * 0.01
                    }, 0) + 9.99}
                </span>

            </div>
            <div className='buttonCont'>
                <button onClick={handleOrder} disabled={cartItems.length === 0}>
                    {loading ? <img src={spinner} alt="loading spinner" /> : "Place Order"}
                </button>
            </div>
        </PaymentSumDiv>
    )
}

const PaymentDiv = styled.div`
    width: 100vw;
    display:flex;
    justify-content:space-between;

    .left {
        width: 80vw;
    }

    .right {
        width: 20vw;
    }
    `

const PaymentSumDiv = styled.div`
    border: 2px solid black;
    border-radius: 6px;
    margin: 10px 16px 10px 6px;
    align-content: center;
    div {
        display: flex;
        margin: 6px;
        justify-content: space-between;
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

    .buttonCont {
        width:100%;
        display:flex;
        justify-content: center;
    }
    .line {
        border-bottom: 1px solid black;
    }

`
export default PaymentPage

import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import axios from 'axios'
const ViewInvoice = () => {
    const { orderNo } = useParams()
    const [pdf, setPdf] = useState("")

    useEffect(() => {
        const fetchInvoices = async () => {
            const response = await axios.get("http://localhost:8000/api/invoice")
            console.log(response.data)
            for (const i of response.data) {
                console.log(i.orderNo)
                if (i.orderNo === orderNo) {
                    setPdf(i.pdf)

                }
            }
        }

        fetchInvoices()
    }, [orderNo])

    return (
        <Embed src={pdf} />
    )
}

const Embed = styled.embed`
    width:100%;
    height:100vh;
    margin-bottom:0px;`

export default ViewInvoice
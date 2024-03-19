import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import styled from 'styled-components';
import { Link } from 'react-router-dom';


const options = { month: 'long', day: 'numeric', year: 'numeric' };

const InvoicePanel = () => {
    const [range, setRange] = useState({
        startDate: new Date(2023, 0, 1),
        endDate: new Date(),
        key: 'selection',
    })
    const [displayDatePicker, setDisplayDatePicker] = useState(false)
    const [invoiceList, setInvoiceList] = useState([])

    const handleChange = (ranges) => {
        setRange({
            ...range,
            startDate: ranges.selection.startDate,
            endDate: ranges.selection.endDate
        })
    }

    const handleOk = async () => {
        setDisplayDatePicker(false)
    }

    useEffect(() => {
        const fetchInvoices = async () => {
            const response = await axios.get("http://localhost:8000/api/invoice")
            setInvoiceList(response.data.sort((a, b) => Date.parse(a.date) - Date.parse(b.date)))
        }

        fetchInvoices()
    }, [])



    return (
        <Div>
            <div className='bar'>
                <div>
                    <DateSpan onClick={() => setDisplayDatePicker(!displayDatePicker)} >
                        <span>{range.startDate.toLocaleDateString("en-US", options)}</span>
                        <span>{" - "}</span>
                        <span>{range.endDate.toLocaleDateString("en-US", options)}</span>
                    </DateSpan>
                    <button className='b' onClick={handleOk}>Get</button>
                </div>
            </div>

            <table>
                <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Invoice</th>
                    </tr>
                </thead>
                <tbody>
                    {invoiceList
                        .filter(i => Date.parse(i.date) >= range.startDate && Date.parse(i.date) <= range.endDate)
                        .map(p => {
                            return (
                                <tr>
                                    <td>{p["orderNo"]} </td>
                                    <td>{(new Date(p.date)).toLocaleDateString("en-US", options)} </td>
                                    <td><Link to={`/pdfview/${p.orderNo}`}>View Invoice</Link></td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>



            {displayDatePicker &&
                <DatePicker>
                    <DateRangePicker
                        ranges={[range]}
                        onChange={handleChange}
                    />
                </DatePicker>}

        </Div>
    )
}

const Div = styled.div`
    width:100%;
    height:100%;
    position: relative;

    table {
        width: 60%;
        th{
            font-size: 20px;
            border-bottom: 1px solid black;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid black;
        }
    }
    .bar {
        box-sizing:border-box;
        display: flex;
        align-items:center;
        gap:500px;
        height: 40px;
        width: 100%;
        padding: 0px 60px;        
    }

    .b {
        background-color: #3f51b5;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 7px;
        width: 70px;
        margin: 20px 0px;
        &:hover {
        background-color: #2c3e50;
        }
    }
`

const DateSpan = styled.span`
    display: inline-flex;
    justify-content:space-around;
    width: 350px;
    padding: 10px;
    border-radius: 6px;
    :hover{
        background-color:#b5b5b5;
        cursor: pointer;
    }
    
    `

const DatePicker = styled.div`
    position:absolute;
    top: 40px;
    left: 70px;
    border: 1px solid black;

    .rdrDefinedRangesWrapper, .rdrDateDisplayWrapper {
        display: none;
    }

    .rdrMonth {
        padding-bottom: 0px;
    }
`

export default InvoicePanel
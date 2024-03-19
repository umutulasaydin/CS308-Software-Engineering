import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import ProfitLossPage from './ProfitLossPage'
import ChangeStockPage from './ChangeStockPage'
import { Link } from 'react-router-dom'
import xmark from '../assets/xmark.svg'
import InvoicePanel from '../components/InvoicePanel'
import AddRemoveProductPanel from '../components/AddRemoveProductPanel'
import AddRemoveCatPanel from '../components/AddRemoveCatPanel'
import PricesPage from '../components/PricesPage'
import CommentsAdminPanel from './CommentsAdminPanel'
import Refund from '../components/Refunds'
import Delivery from '../components/DeliveryPanel'

const AdminPanel = () => {
    const [userType, setUserType] = useState("")
    const [sIdx, setSIdx] = useState(0)
    const [salesSelected, setSalesSelected] = useState(salesList[0].component)
    const [productSelected, setProductSelected] = useState(productList[0].component)

    const setSalesContent = (idx) => {
        setSIdx(idx)
        setSalesSelected(salesList[idx].component)

    }

    const setProductsContent = (idx) => {
        setSIdx(idx)
        setProductSelected(productList[idx].component)
    }

    useEffect(() => {
        setUserType(window.localStorage.getItem('type'))
    }, [])

    switch (userType) {
        case "sales":
            return <AdminPanelBody
                sIdx={sIdx}
                selected={salesSelected}
                setContent={setSalesContent}
                list={salesList} />

        case "product":
            return <AdminPanelBody
                sIdx={sIdx}
                selected={productSelected}
                setContent={setProductsContent}
                list={productList} />

        default:
            return (
                <NoAuthDiv>
                    <img src={xmark} alt="cross icon" />
                    <div>You are not authorized to view this page.</div>
                </NoAuthDiv>
            )
    }
}

const salesList = [
    {
        name: "Invoices",
        component: <InvoicePanel />
    },
    {
        name: "Refunds",
        component: <Refund />
    },
    {
        name: "Prices",
        component: <PricesPage />
    },
    {
        name: "Sales Statistics",
        component: <ProfitLossPage />
    },
]

const productList = [
    {
        name: "Product Management",
        component: <AddRemoveProductPanel />
    },
    {
        name: "Stock Management",
        component: <ChangeStockPage />
    },
    {
        name: "Delivery",
        component: <Delivery />
    },
    {
        name: "Category Management",
        component: <AddRemoveCatPanel />
    },
    {
        name: "Comment Approve/Deny",
        component: <CommentsAdminPanel />
    }
]

const AdminPanelBody = ({ sIdx, selected, setContent, list }) => {
    return (
        <Div>
            <div className='head'><HeadLink to={"/"}><h1>PEAR.</h1></HeadLink> </div>
            <div className='body'>
                <div className='titleList'>
                    {list.map((el, idx) => {
                        return idx === sIdx
                            ? (
                                <div className='selected' onClick={() => setContent(idx)} key={el.name}>
                                    <span>{el.name}</span> {">"}
                                </div>
                            )
                            : (
                                <div onClick={() => setContent(idx)} key={el.name}>
                                    <span>{el.name}</span>
                                </div>
                            )
                    })}
                </div>
                <div className='content'>
                    {selected}
                </div>
            </div>
        </Div >
    )
}

const Div = styled.div`
    .head {
        padding-left: 2vw;
        height: 14vh;
        overflow:hidden;
        box-sizing: border-box;
        padding-top:24px;
        padding-bottom: 24px;
        border-bottom: 15px solid black;
    }

    h1 {
        margin-top:0;
    }
    .body {
        padding-left: 2vw;
        height:86vh;
        display: flex;
        flex-direction:row;
    }

    .titleList {
        padding-top: 16px;
        box-sizing: border-box;
        border-right: 2px solid black;
        width: 17vw;
        font-size: 18px;
        div{
            padding: 10px 4px;
            :hover {
                color: #3f51b5;
                cursor: pointer;
            }
        }

        span {
            display:inline-block;
            width: 90%;
        }
        .selected {
            color: #3f51b5;
        }
    }

    .content {
        width:100%;
        height: 100%;
        padding-bottom:0px;
        overflow-y: scroll;
    }
`

const NoAuthDiv = styled.div`
    width:100vw;
    height:100vh;
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; 
    font-size: 24px;   
    img {
        margin-bottom:50px;
    }
`
const HeadLink = styled(Link)`
    text-decoration:none;
    color:black;
`
export default AdminPanel
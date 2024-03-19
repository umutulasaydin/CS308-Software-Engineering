import styled from 'styled-components'
const Invoice = ({ order }) => {
    return (
        <InvoiceCont>
            <h1>
                ORDER
            </h1>

            <div className='top'>
                <div>
                    <div>Billing to:</div>
                    <div>{order["customer"]["name"]}  {order["customer"]["surname"]}</div>
                    <div>{order["customer"]["email"]}</div>
                    <div>{order["address"]["detail"]}</div>
                </div>
                <div>
                    <div>Order #:</div>
                    <div>{order["orderNo"]}</div>
                </div>
            </div>
            <table>
                <colgroup>
                    <col style={{ width: "46%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                </colgroup>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order["products"].map((p) => {
                        return (
                            <tr key={p["name"]}>
                                <td>{p["name"]}</td>
                                <td className='num'>${p["price"] * (100 - p.discount) / 100}</td>
                                <td className='num'>{p["qty"]}</td>
                                <td className='num'>${p["price"] * p["qty"] * (100 - p.discount) / 100}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className='bottom'>
                Shipping: $9.99
            </div>
            <div className='bottom'>
                Total: ${order["price"]}
            </div>
        </InvoiceCont>
    )
}

const InvoiceCont = styled.div`
    width: 1000px;
    box-sizing: border-box;
    padding: 100px 100px 100px 100px;
    .top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    table {
        width: 100%;
        padding-top: 40px;
        padding-bottom: 40px;
    }

    th {
        padding-top: 20px;
        padding-bottom: 20px;
    }

    thead {
        background-color: black;
        color: white;
    }

    td {
        padding-top: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid black;
    }
    .num {
        text-align: center;
    }

    .bottom {
        text-align: right;
    }
 `
export default Invoice
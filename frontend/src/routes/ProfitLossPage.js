import { addDays } from "date-fns";
import React, { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from "react-chartjs-2"
import styled from "styled-components";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Profit Chart',
        },
    },
};


function ProfitLossPage() {
    var token = window.localStorage.getItem('token');
    const [data, setData] = useState([]);
    const [state, setState] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    async function getProfit(isoStartDate, isoEndDate) {
        try {
            const response = await axios.get(`http://localhost:8000/api/getProfit/${isoStartDate}/${isoEndDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
            if (response.status === 200) {
                console.log("success:\n", response.data)
                setData(response.data)
                var revenue = 0;
                var profit = 0;
                var cost = 0;
                var arr = []
                response.data.forEach(item => {
                    revenue += item.price;
                    profit += item.price - item.cost;
                    cost += item.cost;
                })
                setTotalRevenue(revenue);
                setTotalProfit(profit);
                setTotalCost(cost);

                
            }
            else {
                console.log("getProfit failed")
            }
        } catch (error) {
            console.log("catch getProfit", error)
        }
    }

    useEffect(() => {

        if (state.length === 0) {
            setState([
                {
                    startDate: new Date(),
                    endDate: addDays(new Date(), 7),
                    key: "selection"
                }
            ]);
        }
    }, [state, setState]);

    const handleDateChange = (item) => {
        var isoStartDate = item.selection.startDate.toISOString()
        var isoEndDate = item.selection.endDate.toISOString()
        console.log("start:", isoStartDate, "\nend:", isoEndDate)
    }

    return (
        <Container>
            <Div>

                <div key={JSON.stringify(state)} className="dateSelect">
                    <DateRangePicker
                        onChange={(item) => {
                            setState([item.selection])
                            handleDateChange(item)
                        }}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        editableDateInputs={true}
                        dateDisplayFormat="MM/dd/yyyy"
                        months={1}
                        ranges={state}
                        direction="vertical"

                    />
                    <br />
                    <button className="submitButton" style={{ width: "100%", height: "40px" }} onClick={() => {
                        var start = state[0].startDate.toISOString()
                        var end = state[0].endDate.toISOString()
                        getProfit(start.substr(0, 10),
                            end.substr(0, 10)
                        )
                    }
                    }>Submit</button>
                </div>

                <div className="chart">
                    <Line options={options} data={{
                        labels: data.map((item) => item["date"].substr(0, 10)),
                        datasets: [
                            {
                                label: "Profit ($)",
                                data: data.map((item) => item["price"] - item["cost"]),
                                borderColor: "green"
                            },
                            {
                                label: "Cost ($)",
                                data: data.map((item) => item["cost"]),
                                borderColor: "red"
                            },
                            {
                                label: "Revenue ($)",
                                data: data.map((item) => item["price"]),
                                borderColor: "blue"
                            }
                        ]
                    }}></Line>
                </div>


            </Div>
            <div className="resultText">
                Total Revenue: { totalRevenue.toLocaleString("en-US", {  style: "currency",  currency: "USD"}) } <br />
                Total Profit: { totalProfit.toLocaleString("en-US", {  style: "currency",  currency: "USD"}) } <br />
                Total Cost: { totalCost.toLocaleString("en-US", {  style: "currency",  currency: "USD"}) } <br />
            </div>
        </Container>
    )
}

export default ProfitLossPage;


const Div = styled.div`

display: flex;
justify-content: center;
.chart {
    width: 55vw;

}

.dateSelect {
    width: 40vw;

    margin: 0 20px 0 0;
}

.submitButton {
    background-color: #3f51b5;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    padding: 10px;
    width: 100%;
    margin: 20px 0px;
    &:hover {
      background-color: #2c3e50;
    }
  }
`

const Container = styled.div
    `
margin: 20px 20px 0 20px;
display: flex;
flex-direction: column;

.resultText {
    font-weight: bold;
    font-size: 2em;
}
`
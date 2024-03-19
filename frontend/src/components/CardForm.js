import styled from 'styled-components'

const CardInput = ({ card, setCard, showMsg }) => {

    const handleCardNumberChange = (event) => {
        const cleanedInput = event.target.value.replace(/[^0-9]/g, '');
        const formattedInput = cleanedInput.replace(/(\d{4})/g, '$1 ').trim();

        setCard({ ...card, "number": formattedInput })
    };

    const handleNameChange = (event) => {
        setCard({ ...card, "name": event.target.value })
    }

    const handleCvcChange = (event) => {
        const formattedCvc = event.target.value.replace(/[^0-9]/g, '')

        setCard({ ...card, "cvc": formattedCvc })
    }

    const handleMonthChange = (event) => {
        event.preventDefault();
        setCard({ ...card, "month": event.target.value })
    }

    const handleYearChange = (event) => {
        event.preventDefault();
        setCard({ ...card, "year": event.target.value })
    }

    return (
        <StyledDiv>
            {showMsg && <Msg>Please fill the card information correctly.</Msg>}
            <label>
                <span>Card Number</span>
                <WideInput
                    type="text"
                    value={card.number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    placeholder="••••  ••••  ••••  ••••"
                />
            </label>
            <label>
                <span>Name</span>
                <WideInput
                    inputMode='text'
                    name="nameOnCard"
                    type='text'
                    value={card.name}
                    onChange={handleNameChange} />
            </label>

            <div className='thirdRow'>
                <label>
                    <span>Expiration Date</span>
                    <MonthSelection month={card.month} setMonth={handleMonthChange} />
                    <YearSelection year={card.year} setYear={handleYearChange} />
                </label>

                <label>
                    <span>CVC</span>
                    <Input
                        inputMode='numeric'
                        name="cvc"
                        value={card.cvc}
                        onChange={handleCvcChange}
                        maxLength={3} />
                </label>
            </div>

        </StyledDiv>
    )
}

const MonthSelection = ({ month, setMonth }) => {
    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    return (
        <select value={month} onChange={setMonth}>
            {months.map((m) => (
                <option key={m} value={m}>{m}</option>
            ))}
        </select>
    )
}

const YearSelection = ({ year, setYear }) => {
    const years = []
    for (let index = 2023; index < 2032; index++) {
        years.push(index.toString())
    }
    return (
        <select value={year} onChange={setYear}>
            {years.map((y) => (
                <option key={y} value={y}>{y}</option>
            ))}
        </select>
    )
}

const StyledDiv = styled.div`
    box-sizing: content-box;
    border-bottom: 2px solid black;
    padding: 16px;
    margin: 16px;
    font-size: 16px;
    
    label {
        display: block;
        margin-bottom: 10px;
    }

    span {
        display: block;
        margin-bottom: 3px;
    }

    .thirdRow {
        display:flex;
        gap: 36px;
    }

    select {
        font-size:16px;
    }
`

const WideInput = styled.input`
    font-size:20px;
    width: 250px;
    border-radius: 4px;
`

const Input = styled.input`
    font-size:20px;
    width: 100px;
    border-radius: 4px;
`

const Msg = styled.div`
    color: red;
    background-color: rgba(255, 0, 0, 0.2);
    font-size: 15px;
    padding: 0.5em;
    border-left: 7px solid red;
    border-radius: 4px;
    margin-bottom: 0.5em;
`
export default CardInput
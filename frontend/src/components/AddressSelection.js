import React, { useState } from 'react'
import styled from 'styled-components'
import AddressInput from './AddressInput';


const AddressSelection = ({ addresses, onChange, setAddresses }) => {
    const [select, setSelect] = useState(0);
    const [showAddressInput, setShowAddressInput] = useState(false)

    return (
        <StyledDiv>
            Shipping address
            {addresses.map((adr, index) => {
                return (
                    <AddressLabel key={index} active={select === index}>
                        <input
                            type='radio'
                            value={index}
                            name='address'
                            onChange={() => {
                                setSelect(index)
                                return onChange(index)
                            }}
                            checked={select === index}
                        />
                        <span>{adr.detail}</span>
                    </AddressLabel>)
            })}

            {showAddressInput
                ? <AddressInput setDisplay={setShowAddressInput} addresses={addresses} setAddresses={setAddresses} />
                : <button onClick={() => setShowAddressInput(true)}>Add new</button>}
        </StyledDiv>
    )
}

const StyledDiv = styled.div`
    box-sizing: content-box;
    border-bottom: 2px solid black;
    padding: 16px;
    margin: 16px;
    font-size: 18px;
`

const AddressLabel = styled.label`
    padding: 8px 4px;
    border-radius: 8px;
    display:block;
    margin:5px;
    background-color: ${props => props.active ? "rgb(240, 226, 105, 0.2)" : "white"};
    border: ${props => props.active ? "0.01em solid orange" : "0.01em solid white"};
`
export default AddressSelection
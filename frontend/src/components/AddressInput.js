import axios from 'axios'
import React, { useState } from 'react'

const AddressInput = ({ setDisplay, addresses, setAddresses }) => {
    const [address, setAddress] = useState({
        "name": "",
        "detail": "",
        "phoneNumber": ""
    })

    const handleSubmit = async (event) => {
        event.preventDefault()

        const config = { headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } }
        const response = await axios.post("http://localhost:8000/api/address", address, config)

        setAddresses([...addresses, response.data])
        setDisplay(false)
    }
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='name'>Name: </label>
                    <input
                        type='name'
                        id='name'
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, "name": e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='phoneNumber'>Phone: </label>
                    <input
                        type='phoneNumber'
                        id='phoneNumber'
                        value={address.phoneNumber}
                        onChange={(e) => setAddress({ ...address, "phoneNumber": e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='detail'>Detail: </label>
                    <textarea
                        type='detail'
                        id='detail'
                        value={address.detail}
                        onChange={(e) => setAddress({ ...address, "detail": e.target.value })}
                        required
                    />
                </div>
                <button type='submit'>Add</button>
            </form>
            <button onClick={() => setDisplay(false)}>Cancel</button>
        </div>
    )
}

export default AddressInput
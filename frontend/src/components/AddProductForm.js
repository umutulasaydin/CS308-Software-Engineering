import styled from 'styled-components';
import { useState, useEffect } from 'react';
import axios from 'axios';
import blobToBase64 from '../utils/blobToBase64';
const AddProductForm = ({ setIsAdd }) => {
    const [cats, setCats] = useState([])
    const [selected, setSelected] = useState("")
    const [upd, setUpd] = useState({})

    useEffect(() => {
        const fetchCats = async () => {
            const data = (await axios.get("http://localhost:8000/api/category")).data
            setCats(data)
            setSelected(data[0].name)
            setUpd({ category: data[0].id })
        }

        fetchCats()
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        const base64img = await blobToBase64(upd.image)
        const a = {
            ...upd,
            image: base64img,
            stock: parseInt(upd.stock, 10),
            price: parseInt(upd.price, 10),
            cost: parseInt(upd.cost, 10)
        }

        try {
            await axios.post("http://localhost:8000/api/product", a)
            setIsAdd(false)
            window.location.reload()

        } catch {
            alert("Could not add product, please try again.")
        }
    }
    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <Field id={"name"} name={"Name"} upd={upd} setUpd={setUpd} isNarrow={false} isLeft={false} type="text" />
                <Field id={"description"} name={"Description"} upd={upd} setUpd={setUpd} isNarrow={false} isLeft={false} type="text" />
                <Field id={"model"} name={"Model"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={true} type="text" />
                <Field id={"warranty"} name={"Warranty"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={false} type="text" />
                <div></div>
                <Field id={"brand"} name={"Brand"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={true} type="text" />
                <Field id={"distributer"} name={"Distributor"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={false} type="text" />
                <Field id={"price"} name={"Price"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={true} type="number" />
                <Field id={"cost"} name={"Cost"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={false} type="number" />
                <Field id={"stock"} name={"Stock"} upd={upd} setUpd={setUpd} isNarrow={true} isLeft={true} type="number" />

                <div className='narrow'>
                    <label htmlFor='cat'>Category:</label>
                    <select value={selected} onChange={(event) => {
                        event.preventDefault()
                        setSelected(event.target.value)
                        setUpd({ ...upd, category: event.target.value })
                    }}
                        required>
                        {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor='image'>Product Image:</label>
                    <input type="file"
                        id="avatar" name="avatar"
                        accept="image/png, image/jpeg"
                        onChange={(e) => setUpd({ ...upd, image: e.target.files[0] })}
                        required />
                </div>
                <button className='narrow left' onClick={() => setIsAdd(false)}>Close</button>
                <button className='narrow' type='submit'>Save</button>
            </Form>
        </Container>
    )
}
const Field = ({ id, name, upd, setUpd, isNarrow, isLeft, type }) => {
    let className = ""
    className = isNarrow ? className.concat("narrow") : className
    className = isLeft ? className.concat(" left") : className
    return (
        <div className={className}>
            <label htmlFor={id}>{name}:</label>
            <input
                type={type}
                id={id}
                value={upd[id]}
                onChange={(e) => setUpd({ ...upd, [id]: e.target.value })}
                required
            />
        </div>
    )
}

const Form = styled.form`
    width: 60%;
    label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
    }

    input {
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
        display: block;
        font-size: 16px;
        margin-bottom: 10px;
        padding: 10px;
        width: 100%;
    }

    .narrow {
        width: 40%;
        display: inline-block;
        
    }

    .left {
        margin-right: 20%;
    }

    button {
        background-color: #3f51b5;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 10px;
        margin: 20px 0px;
        width: 40%;
        &:hover {
        background-color: #2c3e50;
        }
    }

    select {
        padding: 10px;
        font-size: 16px;
    }
`

const Container = styled.div`
    display: flex;
    justify-content: center;
    border-radius: 8px;
    padding: 30px;
`

export default AddProductForm
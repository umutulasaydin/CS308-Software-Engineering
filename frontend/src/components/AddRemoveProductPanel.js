import React, { useEffect, useState } from 'react'
import axios from 'axios';
import styled from 'styled-components';
import UpdateProductForm from './UpdateProductForm';
import AddProductForm from './AddProductForm';
const AddRemoveProductPanel = () => {
    const [items, setItems] = useState([])
    const [searchText, setSearchText] = useState("")
    const [filteredItems, setFilteredItems] = useState([])
    const [showAdd, setShowAdd] = useState(false)

    useEffect(() => {
        const fetchItems = async () => {
            const response = await axios.get("http://localhost:8000/api/getProducts?category=all")
            setItems(response.data.filter(p => !p.deleted))
            setFilteredItems(response.data.filter(p => !p.deleted))
        }

        fetchItems()
    }, [])

    return (
        <Main>
            {showAdd
                ? <AddProductForm setIsAdd={setShowAdd} />
                : <div>
                    <Top>
                        <input type='text' value={searchText} onChange={(e) => {
                            setSearchText(e.target.value)
                            setFilteredItems(items.filter((item) => item.name.toLowerCase().includes(e.target.value.toLowerCase())))
                        }} />
                        <button onClick={() => setShowAdd(true)}>Add New</button>
                    </Top>
                    {filteredItems.map(item => <ProductCard key={item.id} item={item} />)}
                </div>}
        </Main>
    )
}

const ProductCard = ({ item }) => {
    const [closed, setClosed] = useState(true)
    const [upd, setUpd] = useState(item)

    const handleRemove = async (event) => {
        event.preventDefault()
        await axios.delete(`http://localhost:8000/api/product?id=${item.id}`)
        window.location.reload()
    }
    return (
        <ListItem>
            <div className='top'>
                <img className='productImg' src={item.image} alt={item.name} />
                <span>{item.name} </span>
                <button onClick={() => {
                    setClosed(!closed)
                    setUpd(item)
                }}>
                    {closed ? "Edit" : "Close"}
                </button>
                <button onClick={handleRemove}>Remove</button>
            </div>

            {closed
                ? null
                : (<UpdateProductForm upd={upd} setUpd={setUpd} setClosed={setClosed} />)}
        </ListItem>
    )
}

const Top = styled.div`
    height: 50px;
    padding: 20px 50px;
    border-bottom: 1px solid black;
    input {
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
        display: inline-block;
        font-size: 16px;
        margin-bottom: 10px;
        padding: 10px;
        width: 50%;
    }

    button {
        background-color: #3f51b5;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 10px;
        width: 10%;
        margin-left: 39%;
        &:hover {
        background-color: #2c3e50;
        }
    }
`
const ListItem = styled.div`
    border-bottom: 1px solid black;
    min-height: 100px;
    padding-left:30px;

    .productImg {
        width: 100px;
        height: 100px;
    }

    span {
        width: 60%;
    }

    .top {
        display: flex;
        align-items: center;
        gap: 30px;
    }

    button {
        background-color: #3f51b5;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 10px;
        width: 10%;
        &:hover {
        background-color: #2c3e50;
        }
    }
`

const Main = styled.div`
    position:relative;
`
export default AddRemoveProductPanel
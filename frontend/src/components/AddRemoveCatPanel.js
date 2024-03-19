import React, { useEffect, useState } from 'react'
import axios from 'axios';
import styled from 'styled-components';
import AddCatForm from './AddCatForm';

const AddRemoveCatPanel = () => {
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [showAddCategory, setShowAddCategory] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await axios.get("http://localhost:8000/api/category")
            setCategories(response.data)
        }

        fetchCategories()
    }, [])

    const deleteCategory = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/category?id=${selectedCategory}`)
            window.location.reload()
        } catch {
            alert("Could not remove category, please try again.")
        }
    }

    return (
        <Main>
            <h1>Add a New Empty Category</h1>
            {showAddCategory 
                ? <AddCatForm setIsAddCategory={setShowAddCategory} />
                : <div>
                    <button onClick={() => setShowAddCategory(true)}>Add New Category</button>
                    <div>
                        <h1>or</h1>
                        <h1>Select a Category to Remove</h1>
                        <p>Note that when the category is deleted, all the products under that category will also be deleted!</p>
                        <select onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <button onClick={deleteCategory}>Remove</button>
                    </div>
                </div>}
        </Main>
    )
}

const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;

    button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background-color: #0d6efd;
        color: white;
        border: none;
        border-radius: 5px;
        margin-top: 2rem;
        margin-bottom: 2rem;
    }

    button:hover {
        background-color: #0b5ed7;
    }

    div {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
`

export default AddRemoveCatPanel

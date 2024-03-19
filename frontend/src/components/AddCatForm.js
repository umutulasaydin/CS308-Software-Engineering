import styled from 'styled-components';
import { useState } from 'react';
import axios from 'axios';

const AddCatForm = ({ setIsAddCategory }) => {
    const [categoryName, setCategoryName] = useState("");

    const addCategory = async (event) => {
        event.preventDefault()
        try {
            await axios.post("http://localhost:8000/api/category", { name: categoryName })
            setIsAddCategory(false)
            alert("You have added an empty category. Please add a new product in it.");
            window.location.reload()
        } catch {
            alert("Could not add category, please try again.")
        }
    }

    return (
        <Container>
            <Form onSubmit={addCategory}>
                <div>
                    <label htmlFor='cat'>Category:</label>
                    <input type="text" id="cat" value={categoryName} 
                           onChange={(e) => setCategoryName(e.target.value)} required/>
                </div>
                <button className='narrow left' onClick={() => setIsAddCategory(false)}>Close</button>
                <button className='narrow' type='submit'>Save</button>
            </Form>
        </Container>
    )
}

const Form = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.05);

    input, button {
        width: 100%;
        padding: 0.5rem;
        border-radius: 5px;
        border: 1px solid #ccc;
    }

    button {
        cursor: pointer;
        background-color: #0d6efd;
        color: white;
        border: none;
    }

    button:hover {
        background-color: #0b5ed7;
    }
`

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`

export default AddCatForm
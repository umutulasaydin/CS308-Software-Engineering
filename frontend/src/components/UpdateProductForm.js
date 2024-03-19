import styled from 'styled-components';
import blobToBase64 from '../utils/blobToBase64';
import axios from 'axios';

const UpdateProductForm = ({ upd, setUpd, setClosed }) => {

    const handleSubmit = async (event) => {
        event.preventDefault()
        const a = {
            ...upd,
            image: (upd.image instanceof File) ? await blobToBase64(upd.image) : upd.image,
            stock: parseInt(upd.stock, 10),
            price: parseInt(upd.price, 10),
            cost: parseInt(upd.cost, 10)
        }

        try {
            await axios.put("http://localhost:8000/api/product", a)
            setClosed(true)
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
                <div>
                    <label htmlFor='image'>Product Image:</label>
                    <input type="file"
                        id="avatar" name="avatar"
                        accept="image/png, image/jpeg"
                        onChange={(e) => setUpd({ ...upd, image: e.target.files[0] })}
                    />
                </div>
                <button id='submit' type='submit'>Save</button>

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
        &:hover {
        background-color: #2c3e50;
        }
    }

    #submit {
        width: 100%;
        margin-bottom: 2px;
    }
`

const Container = styled.div`
    display: flex;
    justify-content: center;
    background-color: ${props => props.isAdd && "white"};
    border-radius: 8px;
    padding: 30px;
`

export default UpdateProductForm
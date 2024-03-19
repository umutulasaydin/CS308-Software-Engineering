import styled from 'styled-components';

export const CartTotal = styled.div`
display: flex;
flex: 2;
margin-top: 80px;
width: 100%;

h2 {
    text-align: end;
    margin: 20px;
}

hr {
    border: 2px solid black;
}

.total-price {
    width: 100%;
}

.btn-group {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
}
`


import styled from 'styled-components';

export const CartPageContainer = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;


button {
    background-color: #3f51b5;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    padding: 10px;
    width: 100%;
    max-width: 250px;
    margin: 20px 20px;

    &:hover {
      background-color: #2c3e50;
    }
  }

  .btn-group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

  .btn-group-2{
    display: flex;
    flex-direction: row;
    width: 350px;
  }
`


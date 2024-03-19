import styled from 'styled-components';

export const ShoppingCartView = styled.div`
/* List view container */
display: flex;
flex: 4;
align-items: stretch;

h1 {
  text-align: left;
  margin: 20px;
}

ul {
  padding: 0 20px 0 20px;
  list-style-type: none;
}

ul span {
  font-size: 30px;
}

.shopping-cart {
  width: 100%;
}

.empty-list {
  margin-top: 40px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid black;
}

.list-item img {
  max-width: 200px;
  max-height: 200px;
}

.list-item-body {
  margin-left: 20px;
}

.total-price h2 {
    margin: 10px 10px 10px 10px;
    color: red;
}

.list-item-amount {
  font-weight: bold;
  text-align: center;
  padding: 10px;
}


`
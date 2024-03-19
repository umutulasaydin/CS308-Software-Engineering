import styled from 'styled-components';

export const SignupForm = styled.form`
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
  background-color: rgba(255, 255, 255, 0.3);

  h2 {
    margin-top: 0;
    text-align: center;
  }

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

    padding: 10px;
    width: 100%;
  }

  .input-part {
    margin-bottom: 10px;
  }

  button {
    background-color: #3f51b5;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    padding: 10px;
    width: 100%;
    margin: 20px 0px;
    &:hover {
      background-color: #2c3e50;
    }
  }

  .err {
    color: red;
  }
`

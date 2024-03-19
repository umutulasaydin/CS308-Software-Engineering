import React, { useState } from "react";
import { SignupPageContainer } from "../styled/SignupPageContainer";
import { SignupForm } from "../styled/SignupForm";
import { Link, useNavigate } from 'react-router-dom';
import spinner from "../assets/ring-resize.svg"
import axios from 'axios';

function SignupPage() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const [input, setInput] = useState({
    name: '',
    surname: '',
    email: '',
    tax_id: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/signup", input)
      if (response)
        console.log("res true")
      else
        console.log("res false")
      navigate("/login");
    } catch {
      console.log("couldnt signup")
    }
    setLoading(false);
  };

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setInput(preValue => ({
      ...preValue,
      [name]: value
    }));
  }

  const validate = (event) => {
    var { name, value } = event.target;
    setError(preValue => {
      const errObj = {
        ...preValue,
        [name]: ''
      };

      if (name === 'name') {
        if (!value) {
          errObj[name] = 'Name cannot be empty!';
        }
      }
      else if (name === 'surname') {
        if (!value) {
          errObj[name] = 'Surname cannot be empty!';
        }
      }
      else if (name === 'password') {
        if (!value) {
          errObj[name] = 'Password cannot be empty';
        }
        else if (input.password !== input.confirmPassword) {
          errObj['confirmPassword'] = 'Passwords does not match!';
        }
        else {
          errObj['confirmPassword'] = '';
        }
      }
      else if (name === 'confirmPassword') {
        if (!value) {
          errObj[name] = 'Please confirm your password.';
        }
        else if (input.password !== input.confirmPassword) {
          errObj[name] = 'Passwords does not match!';
        }
        else {
          errObj[name] = '';
        }
      }
      else if (name === 'email') {
        if (!value) {
          errObj[name] = 'Email cannot be empty';
        }
        else if (!(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/).test(input.email)) {
          errObj[name] = 'Please enter a valid email';
        }
      }

      return errObj;
    })
  }


  return (
    <SignupPageContainer>
      <SignupForm onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <div className="input-part">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={input.name}
            onChange={onInputChange}
            onBlur={validate}
            required
          />
          {error.name && <span className='err'>{error.name}</span>}
        </div>

        <div className="input-part">
          <label htmlFor="surname">Surname:</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={input.surname}
            onChange={onInputChange}
            onBlur={validate}
            required
          />
          {error.surname && <span className='err'>{error.surname}</span>}
        </div>

        <div className="input-part">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={input.email}
            onChange={onInputChange}
            onBlur={validate}
            required
          />
          {error.email && <span className='err'>{error.email}</span>}
        </div>

        <div className="input-part">
          <label htmlFor="text">Tax Id:</label>
          <input
            type="text"
            id="tax_id"
            name="tax_id"
            value={input.taxId}
            onChange={onInputChange}
            required
          />
        </div>

        <div className="input-part">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={input.password}
            onChange={onInputChange}
            onBlur={validate}
            required
          />
          {error.password && <span className='err'>{error.password}</span>}
        </div>

        <div className="input-part">
          <label htmlFor="confirm-password">Confirm password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={input.confirmPassword}
            onChange={onInputChange}
            onBlur={validate}
            required
          />
          {error.confirmPassword && <span className='err'>{error.confirmPassword}</span>}
        </div>
        <button type="submit">{loading ? <img src={spinner} alt="loading spinner" /> : "Sign Up"}</button>
        <Link to={"/login"}>Already have an account? Login</Link>
      </SignupForm>
    </SignupPageContainer>
  )
}

export default SignupPage
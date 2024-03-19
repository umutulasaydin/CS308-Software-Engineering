import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Profile.css";
import "../styled/Orders.css"
import { Link, useNavigate } from 'react-router-dom';


const Profile = () => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [submitted, setSubmitted] = useState(false); 
    const [adress_name, setAdressname] = useState([]);
    const [adress_num, setAdressnum] = useState([]);
    const [adress, setAdress] = useState([]);
    const [info, setInfo] = useState([]);
    var token = window.localStorage.getItem('token');


    const handleSubmit = (e) => {
        e.preventDefault();
        // You can access the input values from the state variables here
        console.log("Name:", name);
        console.log("Surname:", surname);
        console.log("Email:", email);
        setSubmitted(true);
        // Perform any other actions with the form data here, such as sending it to the backend
    };

    const profileinfo = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/getProfileInfo`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
          }
          );
          if (response.status === 200) {
            setAdress(response.data);
            
          } else {
            console.log("something went wrong");
          }
        } catch {
          console.log("catch");
        }
        try {
            const response = await axios.get(`http://localhost:8000/api/moreProfileInfo`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
            }
            );
            if (response.status === 200) {
              setInfo(response.data);
              
            } else {
              console.log("something went wrong");
            }
          } catch {
            console.log("catch");
          }
      }
    
      useEffect(() => {
        profileinfo();
      }, []);
    
    
    return (
        <div>
        <h1 style={{ textAlign: 'center'} } >Profile Information</h1>
    
          <div className='bigbox'>
            <div className='profile-info'>
                <p className='profile-li'>User Name : {info[0]}</p>
                <p className='profile-li'>User Surname : {info[1]}</p>
                <p className='profile-li'>User Mail : {info[2]}</p>
                <p className='profile-li'>User Type :{info[3]}</p>
                <p className='profile-li'>User TaxID : {info[4]}</p>
                
                </div>
                      {adress.map((add, index) => (
                <div className='addres-info' key={index}>
                    <h3>Address {index + 1} :</h3>
                    <p><strong>Address Name: </strong> {add[0]}</p>
                    <p><strong> Address Phone: </strong>{add[1]}</p>
                    <p><strong>Detailed Address: </strong>{add[2]}</p>
                </div>
))}
   
          </div>
          </div>
           
    );
};

export default Profile;

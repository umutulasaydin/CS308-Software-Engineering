import React, { useState } from 'react';

import { ProfilePageForm } from './ProfilePageForm';



const Adress = () => {

    const [city, setCity] = useState('');
const [country, setCountry] = useState('');
const [district, setDistrict] = useState('');
const [detailedadd, setDetailedAdd] = useState('');
const [postcode, setPostcode] = useState('');
const [submitted, setSubmitted] = useState(false); 

const handleSubmit = (e) => {
    e.preventDefault();
    // You can access the input values from the state variables here

    setSubmitted(true);
    // Perform any other actions with the form data here, such as sending it to the backend
};

return(
<ProfilePageForm onSubmit={handleSubmit}>


    {submitted ? (
        <>
            <h1>Profile Information</h1>
            <p>Address Information: {detailedadd}</p>
            <p>District: {district}</p>
            <p>City: {city}</p>
            <p>Country: {country}</p>
            <p>PostCode: {postcode}</p>

            <button
            onClick={() => {
              setSubmitted(false);
            }}
          >
            Edit
          </button>
        </>
    ): (
        <> 
        <h1>Address Information</h1>
       <label>Detailed adress</label>
       <input
           id="Detailed adress"
           value={detailedadd}
           onChange={(e) => setDetailedAdd(e.target.value)}
           required
       /> 
   
       <label>District:</label>
           <input
               id="District"
               value={district}
               onChange={(e) => setDistrict(e.target.value)}
               required
           /> 
       <label>City:</label>
           <input
               id="City"
               value={city}
               onChange={(e) => setCity(e.target.value)}
               required
           />
   
   
       <label>Country:</label>
           <input
               id="Country"
               value={country}
               onChange={(e) => setCountry(e.target.value)}
               required
           />  
   
           <label>Post Code:</label>
           <input
               id="PostCode"
               value={postcode}
               onChange={(e) => setPostcode(e.target.value)}
               required
           /> 
        <button type="submit">
               Save
           </button>
       </>
       
    )}

</ProfilePageForm>
    
);

};

export default Adress;
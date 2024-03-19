import { useState } from "react";
import spinner from "../assets/ring-resize.svg"

async function addComment(comment) {
  if (token) {
    setLoading(true);
    if (comment === NULL || comment === "") {
      alert("Comment cannot be empty");
    }
    const response = await axios.post("http://localhost:8000/api/addComment", {
      "comment": comment,
      "prod_id": item.id
    },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    )
    setLoading(false);
    if (response.status !== 200) {
      alert("Comment failed. Something went wrong.");
    }
  }
  else {
    alert("You need to log in to comment");
  }
}

const AddComment = () => {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  return (
    <StyledDiv>
      <label htmlFor="comment">Enter Comment:</label>
      <input
        type="text"
        id="comment"
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="btn" onClick={() => addComment(comment)}>
        {loading ? <img src={spinner} alt="loading spinner" /> : "Add Comment"}
      </button>
    </StyledDiv>
  )
}

const StyledDiv = styled.div`
    box-sizing: content-box;
    border-bottom: 2px solid black;
    padding: 16px;
    margin: 16px;
    font-size: 18px;

    input {
      border: 1px solid #ccc;
      border-radius: 5px;
      box-sizing: border-box;
      display: block;
      font-size: 16px;
  
      padding: 10px;
      width: 100%;
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
`

export default AddComment;
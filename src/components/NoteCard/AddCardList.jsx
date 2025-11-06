import React from 'react'

function AddCardList({ addNote }) {
  return (
    <div onClick={ () => addNote("Untitled")}>
        <img src='the small image thumbnail here' alt='the small image thumbnail here' />
        <h4>Add Note</h4>
    </div>
  )
}

export default AddCardList
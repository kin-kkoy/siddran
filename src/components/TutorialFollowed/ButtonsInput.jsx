import React, { useState } from 'react'

function NoteTaking() {

    const [count, setCount] = useState(0);

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [payment, setPayment] = useState("");
    const [shipping, setShipping] = useState("");

    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);
    const increment = () => setCount(count + 1);


    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handleQuantChange = (e) => {
        setQuantity(e.target.value);
    }

    const handlePaymentChange = (e) => {
        setPayment(e.target.value);
    }

    const handleShippingChange = (e) => {
        setShipping(e.target.value);
    }


    return (
        <div>
            <h2>{count}</h2>
            <button onClick={decrement}>Decrement</button>
            <button onClick={reset}>Reset</button>
            <button onClick={increment}>Increment</button>
            <br />
            <br />
            <br />
            <input value={name} placeholder='hi' onChange={handleNameChange} />
            <p>Text: {name}</p>
            <input value={quantity} onChange={handleQuantChange} type='number' />
            <p>Quantity: {quantity}</p>
            <select value={payment} onChange={handlePaymentChange}>
                <option value="">Select an option</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Giftcard">Giftcard</option>
            </select>
            <p>Payment option: {payment}</p>
            <br />
            <br />
            <br />
            <label>
                <input type='radio' value="Pick up" checked={shipping === "Pick up"} onChange={handleShippingChange} /> 
                Pick up
            </label>
            <label>
                <input type='radio' value="Delivery" checked={shipping === "Delivery"} onChange={handleShippingChange} /> 
                Delivery
            </label>
            <p>Mode: {shipping}</p>
            <br />
            <br />
            <br />
        </div>
    )
}

export default NoteTaking
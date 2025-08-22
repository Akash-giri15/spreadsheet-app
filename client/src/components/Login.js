import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'; // Make sure this path is correct

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      // After a successful login, you would typically redirect the user
      // or update the application's state to reflect that they are logged in.
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.message); // Display a user-friendly error message
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Log In</h2>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
        required 
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Log In</button>
    </form>
  );
};

export default Login;
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the user object from the credential
      console.log("Firebase Auth user created:", user);

      if (!user) {
        throw new Error("Firebase user not found after creation.");
      }

      // 2. Get the user's ID token
      const token = await user.getIdToken(true);
      console.log("Retrieved Firebase ID Token:", token); // <-- Add this log to check the token

      // 3. Call your backend to create the user profile in Firestore
      const response = await fetch('http://localhost:5000/api/users/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send the token
        },
        body: JSON.stringify({ name: name })
      });

      if (!response.ok) {
        // Log the server's error response for more details
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error('Failed to create profile on backend.');
      }

      const data = await response.json();
      console.log("Backend response:", data);
      alert("Signup and profile creation successful!");

    } catch (error) {
      console.error("Error during signup process:", error);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
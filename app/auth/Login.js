import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onLoginClick = async (e) => {
    e.preventDefault();
    const loading = toast.loading("Logging in....");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        toast.dismiss(loading);
        toast.success("User Logged In Successfully!");
        setIsAuthenticated(true);
      }
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error.message);
      console.log("Bad User Credentials!", error);
    }
  };
  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={onLoginClick}>Login</button>
    </div>
  );
};

export default Login;

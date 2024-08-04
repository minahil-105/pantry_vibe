import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = ({ setActivePage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const onSignUpClick = async (e) => {
    e.preventDefault();
    const loading = toast.loading("Adding user....");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        toast.dismiss(loading);
        toast.success("User Signed Up Successfully!");
        setActivePage("login");
      }
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Sign Up</h1>
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
      <button
        onClick={onSignUpClick}
        disabled={isLoading || !email || !password}
      >
        SignUp
      </button>
    </div>
  );
};

export default SignUp;

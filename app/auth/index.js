import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import SignUp from "./SignUp";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../firebaseConfig";
const Auth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
  }, []);
  return (
    <div>
      <ToastContainer />
      <>
        {isLoading ? (
          <h1>Loading...</h1>
        ) : (
          !isAuthenticated && (
            <>
              <button onClick={() => setActivePage("signup")}>Sign Up</button>
              <button onClick={() => setActivePage("login")}>Login</button>
              {activePage === "signup" ? (
                <SignUp setActivePage={setActivePage} />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )}
            </>
          )
        )}
      </>
      {isAuthenticated && children}
    </div>
  );
};

export default Auth;

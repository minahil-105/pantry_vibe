import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Grid, TextField, Button, Typography, Container, Box } from '@mui/material';
import "@fontsource/pacifico";
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
    <Container maxWidth="xs" sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
    }}>
      <Box sx={{
        padding: 4,
        borderRadius: 2,
        boxShadow: '0px 0px 10px rgba(182, 146, 194, 1)',
        backgroundColor: '#C9C3E3', // Very light purple color
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ textAlign: 'center',
              fontFamily: 'Pacifico',
              fontSize : 42,
             }}>Sign Up</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ backgroundColor: '#FEFBD8' }} // Cream color
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ backgroundColor: '#FEFBD8' }} // Cream color
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#FFC0CB', '&:hover': { backgroundColor: '#FFB6C1' } }}
              onClick={onSignUpClick}
              disabled={isLoading ||!email ||!password}
            >
              Sign Up
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SignUp;
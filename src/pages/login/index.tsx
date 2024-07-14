import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Container, TextField, Button, Typography, Box, CssBaseline, Avatar, Grid, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import router from 'next/router';
import {setSessionToken} from "@/utils/Session";  // Import de l'utilitaire de gestion des cookies

const theme = createTheme();

interface LoginResponse {
  err: boolean;
  msg?: string;
  token?: string;
}

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post<LoginResponse>('http://localhost:3000/api/v1/auth/login', {
        identifier,
        password,
      });

      if (response.status === 200 && response.data.token) {
        console.log('Connexion réussie');
        setSessionToken(response.data.token); // Enregistrement du token dans le cookie
        console.log(response.data.token);
        router.push('./dashboard');
      } else {
        setErrorMessage(response.data.msg || 'Échec de la connexion. Veuillez vérifier vos informations.');
      }
    } catch (error) {
      console.error('Erreur lors de la requête de connexion :', error);
      setErrorMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    }
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIdentifier(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">Connexion</Typography>
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 3 }}>
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Nom d'utilisateur"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={identifier}
                  onChange={handleUsernameChange}
              />
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Connexion
              </Button>
              {errorMessage && (
                  <Typography variant="body2" color="error" align="center">
                    {errorMessage}
                  </Typography>
              )}
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">J'ai oublié mon mot de passe</Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
  );
};

export default Login;

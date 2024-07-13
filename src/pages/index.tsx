import { Button, Container, Typography, Box } from '@mui/material';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '5rem' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        SecureEduMail
      </Typography>
      <Typography variant="body1" paragraph>
        SecureEduMail est une plateforme éducative qui vise à faciliter la communication et la collaboration entre les étudiants. Il fonctionne sans serveur SMTP, simplement avec une API Rest à déployer. Les adresses électroniques sont intraçables et chiffrées de bout en bout. Seulement l'identité peut-être révélée.
      </Typography>
      <Box mt={4}>
        <Button variant="contained" color="primary" onClick={handleLoginRedirect}>
          Se connecter
        </Button>
      </Box>
    </Container>
  );
};

export default Home;

import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import axios from 'axios'; // Importation de axios
import { destroySession, getAuthToken } from '@/utils/Session';
import router from 'next/router';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: 'grey',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: 'grey',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: 'grey',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
    }),
);

// Définition du type Mail
type Mail = {
  sender: string;
  title: string;
  text: string;
  sentTime: string;
  isAdmin: boolean;
  favorite: boolean;
};

// Exemple de données de mails
const initialMails: Mail[] = [
  { sender: 'john.doe@example.com', title: 'Meeting Reminder', text: 'Just a reminder about the meeting tomorrow at 10 AM.', sentTime: '09:00 AM', isAdmin: true, favorite: false },
  { sender: 'jane.smith@example.com', title: 'Project Update', text: 'The project is progressing as planned.', sentTime: '11:15 AM', isAdmin: false, favorite: false },
  // Ajoutez plus de mails ici
];

// Fonction pour extraire la première phrase du texte
const getFirstSentence = (text: string) => {
  const sentences = text.split('.');
  return sentences[0] + (sentences.length > 1 ? '.' : '');
};

// Composant principal ComponentBox
function ComponentBox({ filter }: { filter: string }) {
  const [mailsState, setMailsState] = React.useState<Mail[]>(initialMails);
  const [archivedMailsState, setArchivedMailsState] = React.useState<Mail[]>([]);

  // Charger les mails depuis localStorage
  React.useEffect(() => {
    const storedMails = localStorage.getItem('mails');
    if (storedMails) {
      setMailsState(JSON.parse(storedMails));
    }
    const storedArchivedMails = localStorage.getItem('archivedMails');
    if (storedArchivedMails) {
      setArchivedMailsState(JSON.parse(storedArchivedMails));
    }
  }, []);

  // Sauvegarder les mails dans localStorage
  React.useEffect(() => {
    localStorage.setItem('mails', JSON.stringify(mailsState));
    localStorage.setItem('archivedMails', JSON.stringify(archivedMailsState));
  }, [mailsState, archivedMailsState]);

  const handleFavorite = (index: number) => {
    const updatedMails = [...mailsState];
    updatedMails[index].favorite = !updatedMails[index].favorite;
    setMailsState(updatedMails);
  };

  const handleDelete = (index: number) => {
    const updatedMails = mailsState.filter((_, i) => i !== index);
    setMailsState(updatedMails);
  };

  const handleArchive = (index: number) => {
    const mailToArchive = mailsState[index];
    setArchivedMailsState([...archivedMailsState, mailToArchive]);
    handleDelete(index);
  };

  const handleView = (index: number) => {
    // Implement viewing logic here
    console.log('View mail at index:', index);
  };

  const handleRefresh = () => {
    // Here you would typically fetch updated data from your backend or perform any other logic to refresh the mail list
    // For demonstration purposes, we'll just log a message
    console.log('Refreshing mails...');
  };

  const filteredMails = filter === 'Favoris' ? mailsState.filter(mail => mail.favorite) :
      filter === 'Archivés' ? archivedMailsState :
          mailsState;

  return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Liste des Mails
          </Typography>
          <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
          >
            Rafraîchir
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Expéditeur</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Texte</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Heure</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMails.map((mail, index) => (
                  <TableRow key={index}>
                    <TableCell>{mail.sender}</TableCell>
                    <TableCell>{mail.title}</TableCell>
                    <TableCell>{getFirstSentence(mail.text)}</TableCell>
                    <TableCell>{mail.isAdmin ? 'Administrateur' : ''}</TableCell>
                    <TableCell>{mail.sentTime}</TableCell>
                    <TableCell>
                      <Tooltip title="Favoris">
                        <IconButton onClick={() => handleFavorite(index)}>
                          <StarIcon color={mail.favorite ? 'primary' : 'disabled'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton onClick={() => handleDelete(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      {filter !== 'Archivés' && (
                          <Tooltip title="Archiver">
                            <IconButton onClick={() => handleArchive(index)}>
                              <ArchiveIcon />
                            </IconButton>
                          </Tooltip>
                      )}
                      <Tooltip title="Consulter">
                        <IconButton onClick={() => handleView(index)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
  );
}

// Fonction principale de l'application
export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [filter, setFilter] = React.useState<string>('Boîte de réception');
  const [userName, setUserName] = React.useState<string>('');
  const [userEmail, setUserEmail] = React.useState<string>('');

  React.useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Appel à l'API pour récupérer les informations de l'utilisateur
      axios.get(`http://localhost:3000/api/v1/account/${token}/getAccountInfo`)
          .then(response => {
            const { user } = response.data;
            setUserName(user.username);
            setUserEmail(user.SecureUIDMail);
          })
          .catch(error => {
            console.error('Error fetching user info:', error);
          });
    } else {
      router.push('/login');
    }
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuOpen = Boolean(anchorEl);

  const handleLogout = () => {
    destroySession();
    router.push('/login');
  };

  return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: 5,
                  ...(open && { display: 'none' }),
                }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              SecureEduMail
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {userEmail} {/* Affichage de l'email de l'utilisateur */}
              </Typography>
              <Typography variant="body1">
                {userName} {/* Affichage du nom d'utilisateur */}
              </Typography>
            </Box>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="account-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
            >
              <Avatar alt="User" src="/static/images/avatar/1.jpg" />
            </IconButton>
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}>Profil</MenuItem>
              <MenuItem onClick={handleMenuClose}>Mon compte</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Se déconnecter</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {['Boîte de réception', 'Favoris', 'Importants', 'Brouillons', 'Archivés'].map((text, index) => (
                <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                      }}
                      onClick={() => setFilter(text)}
                  >
                    <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                        }}
                    >
                      {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  onClick={() => setFilter('Documentation')}
              >
                <ListItemText primary="Documentation" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                onClick={handleLogout} // Utilisation de la fonction handleLogout
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
            >
              <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
              >
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Se déconnecter" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </Drawer>
        <ComponentBox filter={filter} />
      </Box>
  );
}

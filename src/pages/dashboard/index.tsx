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
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ArchiveIcon from '@mui/icons-material/Archive';
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
    favorite: boolean; // Assurez-vous que favorite est de type boolean
    important: boolean;
};

// Fonction pour extraire la première phrase du texte
const getFirstSentence = (text: string) => {
    if (!text) return ''; // Vérifie si le texte est undefined ou null
    const sentences = text.split('.');
    return sentences[0] + (sentences.length > 1 ? '.' : '');
};


// Exemple de données de mails
const initialMails: Mail[] = [];

// Composant principal ComponentBox
function ComponentBox({ filter }: { filter: string }) {
    const [mailsState, setMailsState] = React.useState<Mail[]>([]);
    const [archivedMailsState, setArchivedMailsState] = React.useState<Mail[]>([]);
    const [sentMailsState, setSentMailsState] = React.useState<Mail[]>([]);
    const [openMailDialog, setOpenMailDialog] = React.useState(false);
    const [recipient, setRecipient] = React.useState('');
    const [mailTitle, setMailTitle] = React.useState('');
    const [mailContent, setMailContent] = React.useState('');
    const [important, setImportant] = React.useState(false);

    function refreshMails() {

        const token = getAuthToken();

        if (token) {
            // Fetch recipient mails
            axios.get(`http://localhost:3000/api/v1/mail/get/recipient/${token}`)
                .then(response => {
                    const { data } = response;
                    if (data.mails && Array.isArray(data.mails)) {
                        const fetchedMails: Mail[] = data.mails.flatMap((mailObj: any) =>
                            Object.values(mailObj).map((mail: any) => ({
                                sender: mail.sender,
                                title: mail.title,
                                text: mail.description,
                                sentTime: mail.time,
                                isAdmin: false,
                                favorite: null,
                                important: mail.important,
                            }))
                        );

                        setMailsState(fetchedMails.filter(mail => !mail.important));
                        setArchivedMailsState(fetchedMails.filter(mail => mail.important));
                    } else {
                        console.error('Data content is not in the expected format:', data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching mails:', error);
                });

            axios.get(`http://localhost:3000/api/v1/mail/get/sender/${token}`)
                .then(response => {
                    const { data } = response;
                    console.log("Data received from API:", data);

                    // Extract mails from the response
                    const mailsArray = data.mails.flatMap((mailObj: any) =>
                        Object.values(mailObj).map((mail: any) => ({
                            sender: mail.sender,
                            title: mail.title,
                            text: mail.description || '', // Assurez-vous que text n'est jamais undefined
                            sentTime: mail.time,
                            isAdmin: false,
                            favorite: false, // Assigner false par défaut pour favorite si non spécifié
                            important: mail.important,
                        }))
                    );

                    setSentMailsState(mailsArray);
                })
                .catch(error => {
                    console.error('Error fetching sent mails:', error);
                });
        }
    }

    React.useEffect(() => {
        refreshMails()
    }, []);


    // Fonction pour marquer un mail comme favori
    const handleFavorite = (index: number) => {
        const updatedMails = [...mailsState];
        updatedMails[index].favorite = !updatedMails[index].favorite;
        setMailsState(updatedMails);
    };

    // Fonction pour archiver un mail
    const handleArchive = (index: number) => {
        const mailToArchive = mailsState[index];
        setArchivedMailsState([...archivedMailsState, mailToArchive]);
        setMailsState(mailsState.filter((_, idx) => idx !== index));
    };

    // Fonction pour consulter un mail
    const handleView = (index: number) => {
        // Implémentez ici la logique de visualisation du mail
        console.log('View mail at index:', index);
    };

    // Fonction pour rafraîchir la liste des mails
    const handleRefresh = () => {
        // Ici, vous récupéreriez généralement les données mises à jour depuis votre backend ou effectueriez toute autre logique pour actualiser la liste de mails
        // À des fins de démonstration, nous allons simplement afficher un message
        console.log('Refreshing mails...');
        refreshMails()
    };

    // Fonction pour ouvrir le dialogue pour envoyer un mail
    const handleOpenMailDialog = () => {
        setOpenMailDialog(true);
    };

    // Fonction pour fermer le dialogue pour envoyer un mail
    const handleCloseMailDialog = () => {
        setOpenMailDialog(false);
        // Réinitialisation des champs du formulaire
        setRecipient('');
        setMailTitle('');
        setMailContent('');
        setImportant(false);
    };

    const filteredMails = filter === 'Favoris' ? mailsState.filter(mail => mail.favorite) :
        filter === 'Archivés' ? archivedMailsState :
            filter === 'Importants' ? archivedMailsState.filter(mail => mail.important) :
                filter === 'Envoyés' ? sentMailsState :
                    filter === 'Brouillons' ? [] :
                        mailsState;

    console.log("Current filter:", filter);
    console.log("Filtered Mails:", filteredMails);


    // Fonction pour envoyer le mail
    const handleSendMail = () => {
        const token = getAuthToken();

        // Convertir l'adresse email du destinataire en token
        axios.get(`http://localhost:3000/api/v1/mail/get/token/${recipient}`)
            .then(response => {
                const { token: recipientToken } = response.data;

                // Envoi des données du mail à l'API
                axios.post(`http://localhost:3000/api/v1/mail/create/${token}/${recipientToken}`, {
                    title: mailTitle,
                    description: mailContent,
                    content: mailContent,
                    important,
                })
                    .then(() => {
                        console.log('Mail sent successfully');
                        // Rafraîchissement de la liste des mails après l'envoi
                        handleRefresh();
                        // Fermeture du dialogue
                        handleCloseMailDialog();
                    })
                    .catch(error => {
                        console.error('Error sending mail:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching recipient token:', error);
            });
    };


    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <DrawerHeader />
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" gutterBottom>
                    Liste des Mails
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenMailDialog}
                    >
                        Nouveau Mail
                    </Button>
                </Box>
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
                                <TableCell>{mail.isAdmin ? 'Admin' : 'Utilisateur'}</TableCell>
                                <TableCell>{mail.sentTime}</TableCell>
                                <TableCell>
                                    <Tooltip title={mail.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                                        <IconButton onClick={() => handleFavorite(index)}>
                                            <StarIcon color={mail.favorite ? "secondary" : "action"} />
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

            {/* Dialogue pour envoyer un mail */}
            <Dialog open={openMailDialog} onClose={handleCloseMailDialog}>
                <DialogTitle>Nouveau Mail</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="recipient"
                        label="Recipient Email Address"
                        type="email"
                        fullWidth
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="mailTitle"
                        label="Mail Title"
                        type="text"
                        fullWidth
                        value={mailTitle}
                        onChange={(e) => setMailTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="mailContent"
                        label="Mail Content"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={mailContent}
                        onChange={(e) => setMailContent(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Switch checked={important} onChange={(e) => setImportant(e.target.checked)} />}
                        label="Important"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMailDialog}>Cancel</Button>
                    <Button onClick={handleSendMail}>Send</Button>
                </DialogActions>

            </Dialog>
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
    const [selectedItem, setSelectedItem] = React.useState<string>('Boîte de réception');

    // Récupérer les informations de l'utilisateur à partir de l'API
    React.useEffect(() => {
        const token = getAuthToken();
        if (token) {
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

    const handleMenuClick = (item: string) => {
        setSelectedItem(item);
        setFilter(item)
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
                    {['Boîte de réception', 'Favoris', 'Envoyés', 'Importants', 'Archivés', 'Brouillons'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                                selected={selectedItem === text}
                                onClick={() => handleMenuClick(text)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {index === 0 ? <InboxIcon /> : index === 1 ? <StarIcon /> : <MailIcon />}
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
                            onClick={() => router.push('https://docs.secureedumail.xyz')}
                        >
                            <ListItemText primary="Documentation" sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <List>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                            }}
                            onClick={handleLogout}
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
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <ComponentBox filter={filter} />
            </Box>
        </Box>
    );
}


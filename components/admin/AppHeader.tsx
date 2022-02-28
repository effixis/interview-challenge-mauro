// next
import { useRouter } from 'next/router';

// react
import { FC, useState } from 'react';

// mui
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Button,
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';

import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import SettingsIcon from '@material-ui/icons/Settings';
import EmojiFoodBeverageIcon from '@material-ui/icons/EmojiFoodBeverage';

// clsx
import clsx from 'clsx';

// utils
import { auth } from '../../utils/Firebase';

/*
original source file drawer
https://material-ui.com/components/drawers/#PersistentDrawerLeft.tsx
*/

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  inside: {
    background: '#f9f9f9',
  },
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  drawerHeaderGap: {
    ...theme.mixins.toolbar
  },
  drawerTitle: {
    padding: theme.spacing(0, 2),
    flex: 1,
    color: theme.palette.primary.main
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export interface AppHeaderProps {
  /** Rendered next to logout button */
  actions?: JSX.Element
}

const AppHeader: FC<AppHeaderProps> = (props) => {

  const classes = useStyles();
  const theme = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const signOut = async () => {
    // sign out the user using firebase API
    // will trigger onAuthStateChanged and thus change
    // the useFirebaseAuth states, therefore change useUser values
    await auth.signOut();

    // Here the redirecting is not a problem as it is
    // not executed during rendering
    router.replace('/login');
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuItems = [
    {
      text: 'Évènements',
      icon: <HomeIcon />,
      route: '/',
    },
    {
      text: 'Clients',
      icon: <AccountBoxIcon />,
      route: '/clients',
    },
    {
      text: 'Menus',
      icon: <RestaurantMenuIcon />,
      route: '/menu',
    },
    {
      text: 'Plats',
      icon: <MenuBookIcon />,
      route: '/carte',
    },
    {
      text: 'Matériel',
      icon: <RestaurantIcon />,
      route: '/material',
    },
    {
      text: 'Boissons',
      icon: <EmojiFoodBeverageIcon />,
      route: '/drinks',
    },
    {
      text: 'Admin',
      icon: <SettingsIcon />,
      route: '/admin',
    },
  ];

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap style={{ flex: 1 }}>
            Mauro Traiteur
          </Typography>

          {props.actions}

          <Button
            color="inherit"
            onClick={signOut}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography variant="h6" className={classes.drawerTitle}>
            Navigation
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon color="primary" /> : <ChevronRightIcon color="primary" />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} onClick={() => router.push(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeaderGap} />

        <div className={classes.inside}>
          {props.children}
        </div>
      </main>
    </div>
  );
}

export default AppHeader;
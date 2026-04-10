import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton,
  Drawer, List, ListItem, ListItemText, Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import native_cave from "../../assets/images/native_cave.png";
import {Link} from "react-router";

export default function MobileNavigation() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuItems = ['Home', 'Menu', 'Services', 'Contact']
  return (
    <>
      <AppBar className="md:hidden bg-white fixed mb-5 z-100">
        <Toolbar>
          {/* 3. The Hamburger Button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
          <MenuIcon className={'bg-black sm:w-10.5 sm:h-10.5'} />
          </IconButton>
          <div className={'flex flex-row gap-4'}>
            <img className={'w-32 h-auto object-contain'}
                 src={native_cave}
                 alt={'native_logo'}/>
          </div>
        </Toolbar>
      </AppBar>

      {/* 4. The Side Drawer Component */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        role={'link'}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box
          sx={{ width: 215 }}
          role="presentation"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div className={'flex flex-row gap-4'}>
            <img className={'ml-1.5 mt-1.5 w-32 h-auto object-contain'}
                 src={native_cave}
                 alt={'native_logo'}/>
          </div>
          <List className={'-mt-2'}>
            {menuItems.map((text) => (
              text.startsWith('Menu') &&
              <ListItem key={text}>
                <Link to={'/#menusection'}>
                  <ListItemText primary={text} />
                </Link>
              </ListItem>
            ))}
            {menuItems.map((text) => (
              !text.startsWith('Menu') && !text.startsWith('Services') &&
              <ListItem key={text}>
                <Link to={'/contact'}>
                  <ListItemText primary={text} />
                </Link>
              </ListItem>
            ))}
            {menuItems.map((text) => (
              text.startsWith('Services') &&
              <ListItem key={text}>
                <Link to={'/#service'}>
                  <ListItemText primary={text} />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
// src/components/SimpleAppBar.js

import React from "react";
import { AppBar, Toolbar, Typography, Switch } from "@mui/material";

function SimpleAppBar({ darkMode, setDarkMode }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MindMentor
        </Typography>
        <Switch
          checked={darkMode}
          onChange={setDarkMode}
          color="default"
        />
      </Toolbar>
    </AppBar>
  );
}

export default SimpleAppBar;

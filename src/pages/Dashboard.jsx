import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const drawerWidth = 220;

export default function Dashboard() {
  const { logout } = useAuth();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        path: "/dashboard",
        icon: <DashboardOutlinedIcon />,
      },
      {
        id: "users",
        label: "Users",
        path: "/dashboard/users",
        icon: <GroupOutlinedIcon />,
      },
      {
        id: "registration",
        label: "Registration",
        path: "/dashboard/registration",
        icon: <PersonAddAlt1OutlinedIcon />,
      },
      {
        id: "adminProfile",
        label: "Admin Profile",
        path: "/dashboard/admin-profile",
        icon: <AdminPanelSettingsOutlinedIcon />,
      },
    ],
    [],
  );

  const activeTab = useMemo(() => {
    if (pathname.startsWith("/dashboard/users")) return "users";
    if (pathname.startsWith("/dashboard/registration")) return "registration";
    if (pathname.startsWith("/dashboard/admin-profile")) return "adminProfile";
    return "overview";
  }, [pathname]);

  const handleNavChange = (path) => {
    setMobileDrawerOpen(false);
    navigate(path);
  };

  const navigationContent = (
    <>
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
            letterSpacing: 0.5,
          }}
        >
          MIG Verify
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ADMIN CONTROL
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeTab === item.id}
            onClick={() => handleNavChange(item.path)}
            sx={{
              color: "gray",
              "&.Mui-selected": {
                borderLeft: "7px solid #000000",
                "&:hover": {
                  color: "white",
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutOutlinedIcon />}
          onClick={logout}
          color="inherit"
        >
          Sign Out
        </Button>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuOutlinedIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
              letterSpacing: 0.4,
            }}
          >
            MIG Verify
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          display: { xs: "none", md: "block" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 0,
          },
        }}
      >
        {navigationContent}
      </Drawer>

      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        variant="temporary"
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: Math.min(drawerWidth, 260),
            boxSizing: "border-box",
          },
        }}
      >
        {navigationContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        {isMobile ? <Toolbar /> : null}
        <Outlet />
      </Box>
    </Box>
  );
}


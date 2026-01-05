"use client";

import {
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openUser, setOpenUser] = useState(pathname?.startsWith("/users") ?? false);

  const toggleUser = () => setOpenUser((prev) => !prev);

  const ListRouter = () => router.push("/users/list");
  const DashboardRouter = () => router.push("/dashboard");
  const CompanyRouter = () => router.push("/company");

  const isActive = (path: string) => pathname === path;
  const isUserActive = pathname?.startsWith("/users");

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          borderRight: "1px dashed rgba(145,158,171,0.2)",
          bgcolor: "#fff",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              background: "linear-gradient(135deg, #5BE584 0%, #00AB55 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>M</Typography>
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Team 1
          </Typography>
          <Badge
            badgeContent="Free"
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "rgba(0,171,85,0.08)",
                color: "#00AB55",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 1,
                padding: "2px 6px",
                position: "relative",
                transform: "none",
                ml: 1,
              },
            }}
          />
        </Stack>
      </Box>

      {/* Overview Section */}
      <List
        subheader={
          <ListSubheader
            sx={{
              bgcolor: "transparent",
              color: "#919EAB",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: "36px",
            }}
          >
            OVERVIEW
          </ListSubheader>
        }
      >
        <ListItemButton
          onClick={DashboardRouter}
          sx={{
            borderRadius: 1,
            mx: 1.5,
            mb: 0.5,
            bgcolor: isActive("/dashboard") ? "rgba(0,171,85,0.08)" : "transparent",
            color: isActive("/dashboard") ? "#00AB55" : "inherit",
          }}
        >
          <ListItemIcon
            sx={{ minWidth: 40, color: isActive("/dashboard") ? "#00AB55" : "inherit" }}
          >
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: isActive("/dashboard") ? 600 : 400,
            }}
          />
        </ListItemButton>
      </List>

      <Divider sx={{ my: 1, borderStyle: "dashed" }} />

      {/* Management Section */}
      <List
        subheader={
          <ListSubheader
            sx={{
              bgcolor: "transparent",
              color: "#919EAB",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: "36px",
            }}
          >
            MANAGEMENT
          </ListSubheader>
        }
      >
        <ListItemButton
          onClick={toggleUser}
          sx={{
            borderRadius: 1,
            mx: 1.5,
            mb: 0.5,
            bgcolor: isUserActive ? "rgba(0,171,85,0.08)" : "transparent",
            color: isUserActive ? "#00AB55" : "inherit",
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: isUserActive ? "#00AB55" : "inherit" }}>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="User"
            primaryTypographyProps={{ fontSize: 14, fontWeight: isUserActive ? 600 : 400 }}
          />
          {openUser ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openUser} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={ListRouter}
              sx={{
                pl: 7,
                borderRadius: 1,
                mx: 1.5,
                mb: 0.5,
                bgcolor: isActive("/users/list") ? "rgba(0,171,85,0.08)" : "transparent",
              }}
            >
              <ListItemText
                primary="List"
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive("/users/list") ? 600 : 400,
                  color: isActive("/users/list") ? "#00AB55" : "inherit",
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton
          onClick={CompanyRouter}
          sx={{
            borderRadius: 1,
            mx: 1.5,
            mb: 0.5,
            bgcolor: isActive("/company") ? "rgba(0,171,85,0.08)" : "transparent",
            color: isActive("/company") ? "#00AB55" : "inherit",
          }}
        >
          <ListItemIcon
            sx={{ minWidth: 40, color: isActive("/company") ? "#00AB55" : "inherit" }}
          >
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Company"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: isActive("/company") ? 600 : 400,
            }}
          />
        </ListItemButton>
      </List>
    </Drawer>
  );
}


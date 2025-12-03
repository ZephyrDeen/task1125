"use client";

import { Box, Collapse, Drawer, List, ListItemButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DataTable from "@/src/template/table/table";

export default function DashboardPage() {
  const [openUser, setOpenUser] = useState(true);
  const router = useRouter();

  const toggleUser = () => {
    setOpenUser(!openUser);
  };

  const ListRouter = () => {
    router.push('/users/list');
  };

  const DashboardRouter = () => {
    router.push('/dashboard');
  };
  const CompanyRouter = () => {
    router.push('/company');
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" open={openUser}>
        <List>
          <ListItemButton onClick={DashboardRouter}>Dashboard</ListItemButton>
          <ListItemButton onClick={CompanyRouter}>Company</ListItemButton>
          <ListItemButton onClick={toggleUser}>User</ListItemButton>
          <Collapse in={openUser}>
            <ListItemButton onClick={ListRouter}>List</ListItemButton>
          </Collapse>
        </List>
      </Drawer>
      <Box sx={{
        flexGrow: 1,
        p: 3,
        ml: "240px",
      }}>

        {/* <EnhancedTable data={USERS} /> */}
        <DataTable />
      </Box>
    </Box>
  );
}

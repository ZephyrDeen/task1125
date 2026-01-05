"use client";

import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMemo, useState } from "react";
import Sidebar from "@/src/components/Sidebar";
import DataTable from "@/src/template/table/table";
import users from "@/public/users.json";

const statusOptions = ["All", "Active", "Pending", "Banned", "Rejected"];

export default function UsersListPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: users.length };
    statusOptions.slice(1).forEach((status) => {
      counts[status] = users.filter((u) => u.status === status).length;
    });
    return counts;
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveStatus(newValue);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: "#fff",
            boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
          }}
        >
          {/* Status Tabs */}
          <Tabs
            value={activeStatus}
            onChange={handleTabChange}
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 48,
                fontWeight: 600,
                fontSize: 14,
                color: "#637381",
                "&.Mui-selected": { color: "#212B36" },
              },
              "& .MuiTabs-indicator": { bgcolor: "#212B36" },
            }}
          >
            {statusOptions.map((status) => (
              <Tab
                key={status}
                value={status}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>{status}</span>
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: 12,
                        fontWeight: 700,
                        bgcolor:
                          status === "All"
                            ? "#212B36"
                            : status === "Active"
                              ? "rgba(34,197,94,0.16)"
                              : status === "Pending"
                                ? "rgba(255,171,0,0.16)"
                                : status === "Banned"
                                  ? "rgba(255,86,48,0.16)"
                                  : "rgba(145,158,171,0.16)",
                        color:
                          status === "All"
                            ? "#fff"
                            : status === "Active"
                              ? "#118D57"
                              : status === "Pending"
                                ? "#B76E00"
                                : status === "Banned"
                                  ? "#B71D18"
                                  : "#637381",
                      }}
                    >
                      {statusCounts[status]}
                    </Box>
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Divider />

          {/* Filters Row */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(145,158,171,0.32)" },
                }}
              >
                <MenuItem value="all">Role</MenuItem>
                <MenuItem value="Content Creator">Content Creator</MenuItem>
                <MenuItem value="HR Recruiter">HR Recruiter</MenuItem>
                <MenuItem value="IT Administrator">IT Administrator</MenuItem>
                <MenuItem value="Financial Planner">Financial Planner</MenuItem>
                <MenuItem value="Graphic Designer">Graphic Designer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#919EAB" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "& fieldset": { borderColor: "rgba(145,158,171,0.32)" },
                },
              }}
            />
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Stack>

          {/* Table */}
          <DataTable statusFilter={activeStatus} roleFilter={roleFilter} searchValue={searchTerm} />
        </Paper>
      </Box>
    </Box>
  );
}

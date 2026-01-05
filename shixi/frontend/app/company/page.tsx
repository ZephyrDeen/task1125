"use client";

import { Box, Divider, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import Sidebar from "@/src/components/Sidebar";
import CompanyTable from "@/src/template/table/companytable";
import { useMemo, useState, useEffect } from "react";

interface Company {
  company_code: string;
  company_name: string;
  level: string;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
}

const levelOptions = ["All", "Level 1", "Level 2", "Level 3", "Level 4"];

export default function CompanyPage() {
  const [activeLevel, setActiveLevel] = useState("All");
  const [companies, setCompanies] = useState<Company[]>([]);

  // Fetch companies from JSON (simulating backend API)
  useEffect(() => {
    fetch("/companies.json")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch(console.error);
  }, []);

  // Calculate level counts
  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { All: companies.length };
    ["1", "2", "3", "4"].forEach((level) => {
      counts[`Level ${level}`] = companies.filter((c) => c.level === level).length;
    });
    return counts;
  }, [companies]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveLevel(newValue);
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
          {/* Level Tabs */}
          <Tabs
            value={activeLevel}
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
            {levelOptions.map((level) => (
              <Tab
                key={level}
                value={level}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>{level}</span>
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: 12,
                        fontWeight: 700,
                        bgcolor:
                          level === "All"
                            ? "#212B36"
                            : level === "Level 1"
                              ? "rgba(34,197,94,0.16)"
                              : level === "Level 2"
                                ? "rgba(32,101,209,0.16)"
                                : "rgba(255,171,0,0.16)",
                        color:
                          level === "All"
                            ? "#fff"
                            : level === "Level 1"
                              ? "#118D57"
                              : level === "Level 2"
                                ? "#1939B7"
                                : "#B76E00",
                      }}
                    >
                      {levelCounts[level]}
                    </Box>
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Divider />

          {/* Table */}
          <Box sx={{ p: 2 }}>
            <CompanyTable levelFilter={activeLevel} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

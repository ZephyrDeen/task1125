"use client";

import { Box, Paper, Typography, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Sidebar from "@/src/components/Sidebar";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import CompanyBarChart from "@/src/components/CompanyBarChart";
import CompanyChartFilters, {
  FilterState,
  Dimension,
} from "@/src/components/CompanyChartFilters";
import CompanyLevelCirclePack from "@/src/components/CompanyLevelCirclePack";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Types
interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
  company: string;
  role: string;
  status: string;
}

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

// Status colors
const statusColors: Record<string, string> = {
  Active: "#00AB55",
  Pending: "#FFAB00",
  Banned: "#FF5630",
};

// D3 Donut Chart Component - User Status Distribution
function UserStatusDonutChart({ users }: { users: User[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const statusData = Object.entries(
    users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || "#637381",
  }));

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || statusData.length === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = Math.min(containerWidth, 280);
    const height = width;
    const radius = width / 2;
    const innerRadius = radius * 0.6;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<(typeof statusData)[0]>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<(typeof statusData)[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10);

    const total = statusData.reduce((sum, d) => sum + d.value, 0);

    // Draw arcs
    svg
      .selectAll("path")
      .data(pie(statusData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("opacity", 0.8);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("opacity", 1);
      });

    // Center text
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "14px")
      .style("fill", "#637381")
      .text("Total Users");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "28px")
      .style("font-weight", "700")
      .style("fill", "#212B36")
      .text(total.toString());
  }, [statusData]);

  return (
    <Box ref={containerRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
      <svg ref={svgRef}></svg>
    </Box>
  );
}

// Company Founded Year by Country Line Chart
function CompanyByCountryChart({ companies }: { companies: Company[] }) {
  // Calculate average founded year per country
  const countryYearData = companies.reduce((acc, company) => {
    if (!acc[company.country]) {
      acc[company.country] = { totalYears: 0, count: 0 };
    }
    acc[company.country].totalYears += company.founded_year;
    acc[company.country].count += 1;
    return acc;
  }, {} as Record<string, { totalYears: number; count: number }>);

  // Sort by country name for consistent display
  const sortedData = Object.entries(countryYearData)
    .map(([country, data]) => ({
      country,
      avgYear: Math.round(data.totalYears / data.count),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));

  const chartData = {
    labels: sortedData.map((d) => d.country),
    datasets: [
      {
        label: "Average Founded Year",
        data: sortedData.map((d) => d.avgYear),
        borderColor: "#00AB55",
        backgroundColor: "rgba(0, 171, 85, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#00AB55",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#00AB55",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(33, 43, 54, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(145, 158, 171, 0.2)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<"line">) => `Average Founded Year: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#637381",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(145, 158, 171, 0.16)",
        },
        ticks: {
          color: "#637381",
          font: {
            size: 12,
          },
          callback: (value: number | string) => value,
        },
        min: 1900,
        max: 2020,
      },
    },
  };

  return (
    <Box sx={{ height: 300 }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}

// Cache for JSON data to avoid re-fetching
let cachedCompanies: Company[] | null = null;

// Fetch companies from JSON (simulating backend API)
async function fetchCompaniesJSON(): Promise<Company[]> {
  if (cachedCompanies) return cachedCompanies;

  const response = await fetch("/companies.json");
  cachedCompanies = await response.json();

  return cachedCompanies!;
}

// Mock backend API request - returns filtered data based on filter conditions
async function fetchFilteredCompanies(filters: FilterState): Promise<Company[]> {
  // Fetch raw data from JSON (simulating backend API)
  const allCompanies = await fetchCompaniesJSON();

  // Simulate backend filtering logic
  const filteredData = allCompanies.filter((company) => {
    if (filters.level.length > 0 && !filters.level.includes(company.level)) return false;
    if (filters.country.length > 0 && !filters.country.includes(company.country)) return false;
    if (filters.city.length > 0 && !filters.city.includes(company.city)) return false;
    if (filters.founded_year.start !== null && company.founded_year < filters.founded_year.start) return false;
    if (filters.founded_year.end !== null && company.founded_year > filters.founded_year.end) return false;
    if (filters.annual_revenue.min !== null && company.annual_revenue < filters.annual_revenue.min) return false;
    if (filters.annual_revenue.max !== null && company.annual_revenue > filters.annual_revenue.max) return false;
    if (filters.employees.min !== null && company.employees < filters.employees.min) return false;
    if (filters.employees.max !== null && company.employees > filters.employees.max) return false;
    return true;
  });

  console.log(`[API Request] Filters:`, filters);
  console.log(`[API Response] Returned ${filteredData.length} records`);

  return filteredData;
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // For stats cards
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // Chart filter states
  const [dimension, setDimension] = useState<Dimension>("level");
  const [chartView, setChartView] = useState<"bar" | "circle">("bar");
  const [filters, setFilters] = useState<FilterState>({
    level: [],
    country: [],
    city: [],
    founded_year: { start: null, end: null },
    annual_revenue: { min: null, max: null },
    employees: { min: null, max: null },
  });

  // Fetch user data and all company data (for stats cards, only once)
  useEffect(() => {
    fetch("/users.json")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);

    // Fetch companies from JSON (simulating backend API)
    fetchCompaniesJSON()
      .then((data) => setAllCompanies(data))
      .catch(console.error);
  }, []);

  // Send request to fetch filtered data whenever filter conditions change
  useEffect(() => {
    const loadFilteredData = async () => {
      setLoading(true);
      try {
        const data = await fetchFilteredCompanies(filters);
        setFilteredCompanies(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilteredData();
  }, [filters]); // Triggers request whenever filters change

  // Extract dropdown options from returned data (cascading filter)
  const uniqueValues = useMemo(() => {
    // Dropdown options are extracted from the currently returned data
    const levels = [...new Set(filteredCompanies.map((c) => c.level))].sort();
    const countries = [...new Set(filteredCompanies.map((c) => c.country))].sort();
    const cities = [...new Set(filteredCompanies.map((c) => c.city))].sort();

    const years = filteredCompanies.map((c) => c.founded_year);
    const revenues = filteredCompanies.map((c) => c.annual_revenue);
    const employeeCounts = filteredCompanies.map((c) => c.employees);

    return {
      levels,
      countries,
      cities,
      yearRange: {
        min: years.length ? Math.min(...years) : 1900,
        max: years.length ? Math.max(...years) : 2024,
      },
      revenueRange: {
        min: revenues.length ? Math.min(...revenues) : 0,
        max: revenues.length ? Math.max(...revenues) : 10000000,
      },
      employeeRange: {
        min: employeeCounts.length ? Math.min(...employeeCounts) : 0,
        max: employeeCounts.length ? Math.max(...employeeCounts) : 10000,
      },
    };
  }, [filteredCompanies]); // Depends on returned data, not original data

  // Calculate stats
  const totalUsers = users.length;
  const totalCompanies = allCompanies.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const totalRevenue = allCompanies.reduce((sum: number, c: Company) => sum + c.annual_revenue, 0);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: PeopleIcon,
      color: "#00AB55",
      bgcolor: "rgba(0,171,85,0.08)",
    },
    {
      title: "Companies",
      value: totalCompanies.toString(),
      icon: BusinessIcon,
      color: "#7635DC",
      bgcolor: "rgba(118,53,220,0.08)",
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      icon: TrendingUpIcon,
      color: "#2065D1",
      bgcolor: "rgba(32,101,209,0.08)",
    },
    {
      title: "Total Revenue",
      value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
      icon: AttachMoneyIcon,
      color: "#FFC107",
      bgcolor: "rgba(255,193,7,0.08)",
    },
  ];

  // Get status counts for legend
  const statusCounts = users.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4, color: "#212B36" }}>
          Dashboard
        </Typography>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 3,
            mb: 3,
          }}
        >
          {stats.map((stat) => (
            <Paper
              key={stat.title}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "#fff",
                boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700} sx={{ color: "#212B36" }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#637381", mt: 0.5 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: stat.bgcolor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <stat.icon sx={{ fontSize: 32, color: stat.color }} />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* Charts Row 1 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" },
            gap: 3,
            mb: 3,
          }}
        >
          {/* Donut Chart - User Status */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "#fff",
              boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: "#212B36", mb: 0.5 }}>
              User Status
            </Typography>
            <Typography variant="body2" sx={{ color: "#637381", mb: 2 }}>
              Distribution by status
            </Typography>

            <UserStatusDonutChart users={users} />

            {/* Legend */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexWrap: "wrap",
                mt: 2,
                pt: 2,
                borderTop: "1px dashed #E5E8EB",
              }}
            >
              {Object.entries(statusCounts).map(([status, count]) => (
                <Box key={status} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: statusColors[status] || "#637381",
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#637381" }}>
                    {status} ({count})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Line Chart - Founded Year by Country */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "#fff",
              boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: "#212B36", mb: 0.5 }}>
              Founded Year by Country
            </Typography>
            <Typography variant="body2" sx={{ color: "#637381", mb: 3 }}>
              Average company founded year per country
            </Typography>

            <CompanyByCountryChart companies={allCompanies} />
          </Paper>
        </Box>

        {/* Dynamic Company Chart with Filters - Toggle between Bar and Circle Pack */}
        <Box sx={{ mt: 3 }}>
          {/* Filter Header with View Toggle */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: "#fff",
              boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#212B36" }}>
                  Company Distribution
                </Typography>
                <Typography variant="body2" sx={{ color: "#637381" }}>
                  {chartView === "bar" ? `By ${dimension}` : "Hierarchy View"} • {filteredCompanies.length} companies
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={chartView}
                exclusive
                onChange={(_, newView) => newView && setChartView(newView)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 2,
                    py: 0.5,
                    "&.Mui-selected": {
                      bgcolor: "#00AB55",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#007B55",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="bar">
                  <BarChartIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  Bar Chart
                </ToggleButton>
                <ToggleButton value="circle">
                  <BubbleChartIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  Circle Pack
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Paper>

          {/* Filters */}
          <CompanyChartFilters
            dimension={dimension}
            onDimensionChange={setDimension}
            filters={filters}
            onFiltersChange={setFilters}
            uniqueValues={uniqueValues}
            filteredCount={filteredCompanies.length}
            hideTitleAndCount
          />

          {/* Chart View */}
          <Box sx={{ position: "relative" }}>
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "#637381" }}>
                  Loading...
                </Typography>
              </Box>
            )}
            {chartView === "bar" ? (
            <CompanyBarChart companies={filteredCompanies} dimension={dimension} />
            ) : (
              <CompanyLevelCirclePack companies={filteredCompanies} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

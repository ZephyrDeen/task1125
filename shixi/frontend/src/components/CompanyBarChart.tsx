"use client";

import { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Types
export interface Company {
  company_code: string;
  company_name: string;
  level: string;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
}

export type Dimension = "level" | "country" | "city";

interface CompanyBarChartProps {
  companies: Company[];
  dimension: Dimension;
}

// Color palette for the bar chart
const chartColors = [
  "#00AB55", // Green
  "#2065D1", // Blue
  "#7635DC", // Purple
  "#FFAB00", // Amber
  "#FF5630", // Red
  "#00B8D9", // Cyan
  "#FF6C40", // Orange
  "#04297A", // Dark Blue
  "#7A4F01", // Brown
  "#0C53B7", // Royal Blue
  "#B78103", // Gold
  "#5119B7", // Deep Purple
];

export default function CompanyBarChart({ companies, dimension }: CompanyBarChartProps) {
  // Aggregate data by selected dimension
  const chartData = useMemo(() => {
    const aggregated = companies.reduce((acc, company) => {
      const key = company[dimension];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by count descending
    const sortedEntries = Object.entries(aggregated).sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedEntries.map(([label]) => (dimension === "level" ? `Level ${label}` : label)),
      datasets: [
        {
          label: "Number of Companies",
          data: sortedEntries.map(([, count]) => count),
          backgroundColor: sortedEntries.map((_, i) => chartColors[i % chartColors.length]),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [companies, dimension]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    events: ["mousemove", "mouseout"] as ("mousemove" | "mouseout")[], // Disable click events, only allow hover for tooltip
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
          label: (context: TooltipItem<"bar">) => `${context.parsed.y ?? 0} companies`,
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
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const,
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* Chart */}
      <Box sx={{ height: 350 }}>
        {companies.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#919EAB",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Data
            </Typography>
            <Typography variant="body2">Adjust filters to see company distribution</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

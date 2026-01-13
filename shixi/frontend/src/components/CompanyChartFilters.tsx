"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Autocomplete,
  TextField,
  Paper,
  Typography,
  Stack,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useState } from "react";

// Types
export interface FilterState {
  level: string[];
  country: string[];
  city: string[];
  founded_year: { start: number | null; end: number | null };
  annual_revenue: { min: number | null; max: number | null };
  employees: { min: number | null; max: number | null };
}

export type Dimension = "level" | "country" | "city";

interface UniqueValues {
  levels: string[];
  countries: string[];
  cities: string[];
  yearRange: { min: number; max: number };
  revenueRange: { min: number; max: number };
  employeeRange: { min: number; max: number };
}

interface CompanyChartFiltersProps {
  dimension: Dimension;
  onDimensionChange: (dimension: Dimension) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  uniqueValues: UniqueValues;
  filteredCount: number;
  hideTitleAndCount?: boolean;
}

// Dimension labels mapping
const dimensionLabels: Record<Dimension, string> = {
  level: "Level",
  country: "Country",
  city: "City",
};

export default function CompanyChartFilters({
  dimension,
  onDimensionChange,
  filters,
  onFiltersChange,
  uniqueValues,
  filteredCount,
  hideTitleAndCount = false,
}: CompanyChartFiltersProps) {
  const [showFilters, setShowFilters] = useState(true);

  // Reset all filters
  const handleResetFilters = () => {
    onFiltersChange({
      level: [],
      country: [],
      city: [],
      founded_year: { start: null, end: null },
      annual_revenue: { min: null, max: null },
      employees: { min: null, max: null },
    });
  };

  // Check if any filters are applied
  const hasActiveFilters =
    filters.level.length > 0 ||
    filters.country.length > 0 ||
    filters.city.length > 0 ||
    filters.founded_year.start !== null ||
    filters.founded_year.end !== null ||
    filters.annual_revenue.min !== null ||
    filters.annual_revenue.max !== null ||
    filters.employees.min !== null ||
    filters.employees.max !== null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
        mb: 3,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent={hideTitleAndCount ? "flex-end" : "space-between"} sx={{ mb: 2 }}>
        {!hideTitleAndCount && (
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#212B36" }}>
            Company Distribution
          </Typography>
          <Typography variant="body2" sx={{ color: "#637381" }}>
            By {dimensionLabels[dimension]} • {filteredCount} companies
          </Typography>
        </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Dimension Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="dimension-select-label">Dimension</InputLabel>
            <Select
              labelId="dimension-select-label"
              value={dimension}
              label="Dimension"
              onChange={(e) => onDimensionChange(e.target.value as Dimension)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(145,158,171,0.32)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#212B36",
                },
              }}
            >
              <MenuItem value="level">Level</MenuItem>
              <MenuItem value="country">Country</MenuItem>
              <MenuItem value="city">City</MenuItem>
            </Select>
          </FormControl>

          {/* Filter Toggle */}
          <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                bgcolor: hasActiveFilters ? "rgba(0, 171, 85, 0.08)" : "transparent",
                color: hasActiveFilters ? "#00AB55" : "#637381",
                "&:hover": {
                  bgcolor: hasActiveFilters ? "rgba(0, 171, 85, 0.16)" : "rgba(145,158,171,0.08)",
                },
              }}
            >
              <FilterAltIcon />
              {showFilters ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Tooltip title="Reset Filters">
              <IconButton
                onClick={handleResetFilters}
                sx={{
                  color: "#FF5630",
                  "&:hover": {
                    bgcolor: "rgba(255, 86, 48, 0.08)",
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Filters Panel */}
      <Collapse in={showFilters}>
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: "#F9FAFB",
            border: "1px solid rgba(145, 158, 171, 0.12)",
          }}
        >
          <Stack spacing={2.5}>
            {/* Multi-Select Dropdowns Row */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {/* Level Filter */}
              <Autocomplete
                multiple
                size="small"
                options={uniqueValues.levels}
                value={filters.level}
                onChange={(_, newValue) => onFiltersChange({ ...filters, level: newValue })}
                getOptionLabel={(option) => `Level ${option}`}
                renderInput={(params) => (
                  <TextField {...params} label="Level" placeholder="Select level" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={`Level ${option}`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(0, 171, 85, 0.16)",
                        color: "#118D57",
                        "& .MuiChip-deleteIcon": {
                          color: "#118D57",
                          "&:hover": { color: "#00AB55" },
                        },
                      }}
                    />
                  ))
                }
                sx={{ flex: 1, minWidth: 180 }}
              />

              {/* Country Filter */}
              <Autocomplete
                multiple
                size="small"
                options={uniqueValues.countries}
                value={filters.country}
                onChange={(_, newValue) => onFiltersChange({ ...filters, country: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Country" placeholder="Select country" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      sx={{
                        bgcolor: "rgba(32, 101, 209, 0.16)",
                        color: "#1939B7",
                        "& .MuiChip-deleteIcon": {
                          color: "#1939B7",
                          "&:hover": { color: "#2065D1" },
                        },
                      }}
                    />
                  ))
                }
                sx={{ flex: 1, minWidth: 180 }}
              />

              {/* City Filter */}
              <Autocomplete
                multiple
                size="small"
                options={uniqueValues.cities}
                value={filters.city}
                onChange={(_, newValue) => onFiltersChange({ ...filters, city: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="City" placeholder="Select city" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      sx={{
                        bgcolor: "rgba(118, 53, 220, 0.16)",
                        color: "#5119B7",
                        "& .MuiChip-deleteIcon": {
                          color: "#5119B7",
                          "&:hover": { color: "#7635DC" },
                        },
                      }}
                    />
                  ))
                }
                sx={{ flex: 1, minWidth: 180 }}
              />
            </Stack>

            {/* Range Filters Row */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {/* Founded Year Range */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#637381", mb: 0.5, display: "block" }}>
                  Founded Year Range
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Start year"
                    value={filters.founded_year.start ?? ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        founded_year: {
                          ...filters.founded_year,
                          start: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    InputProps={{
                      inputProps: {
                        min: uniqueValues.yearRange.min,
                        max: uniqueValues.yearRange.max,
                      },
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Typography sx={{ color: "#919EAB" }}>-</Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="End year"
                    value={filters.founded_year.end ?? ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        founded_year: {
                          ...filters.founded_year,
                          end: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    InputProps={{
                      inputProps: {
                        min: uniqueValues.yearRange.min,
                        max: uniqueValues.yearRange.max,
                      },
                    }}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Box>

              {/* Annual Revenue Range */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#637381", mb: 0.5, display: "block" }}>
                  Annual Revenue ($)
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Min"
                    value={filters.annual_revenue.min ?? ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        annual_revenue: {
                          ...filters.annual_revenue,
                          min: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                  <Typography sx={{ color: "#919EAB" }}>-</Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Max"
                    value={filters.annual_revenue.max ?? ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        annual_revenue: {
                          ...filters.annual_revenue,
                          max: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Box>

              {/* Employees Range */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#637381", mb: 0.5, display: "block" }}>
                  Employees Count
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Min"
                    value={filters.employees.min ?? ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        employees: {
                          ...filters.employees,
                          min: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                  <Typography sx={{ color: "#919EAB" }}>-</Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Max"
                    value={filters.employees.max ?? ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        employees: {
                          ...filters.employees,
                          max: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Collapse>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px dashed rgba(145, 158, 171, 0.2)",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <Typography variant="caption" sx={{ color: "#637381", mr: 1 }}>
              Active filters:
            </Typography>
            {filters.level.length > 0 && (
              <Chip
                size="small"
                label={`Level: ${filters.level.map((l) => `Level ${l}`).join(", ")}`}
                onDelete={() => onFiltersChange({ ...filters, level: [] })}
                sx={{ bgcolor: "rgba(0, 171, 85, 0.08)", color: "#00AB55" }}
              />
            )}
            {filters.country.length > 0 && (
              <Chip
                size="small"
                label={`Country: ${filters.country.join(", ")}`}
                onDelete={() => onFiltersChange({ ...filters, country: [] })}
                sx={{ bgcolor: "rgba(32, 101, 209, 0.08)", color: "#2065D1" }}
              />
            )}
            {filters.city.length > 0 && (
              <Chip
                size="small"
                label={`City: ${filters.city.join(", ")}`}
                onDelete={() => onFiltersChange({ ...filters, city: [] })}
                sx={{ bgcolor: "rgba(118, 53, 220, 0.08)", color: "#7635DC" }}
              />
            )}
            {(filters.founded_year.start !== null || filters.founded_year.end !== null) && (
              <Chip
                size="small"
                label={`Founded: ${filters.founded_year.start ?? "~"} - ${filters.founded_year.end ?? "~"}`}
                onDelete={() => onFiltersChange({ ...filters, founded_year: { start: null, end: null } })}
                sx={{ bgcolor: "rgba(255, 171, 0, 0.08)", color: "#B76E00" }}
              />
            )}
            {(filters.annual_revenue.min !== null || filters.annual_revenue.max !== null) && (
              <Chip
                size="small"
                label={`Revenue: $${filters.annual_revenue.min ?? "~"} - $${filters.annual_revenue.max ?? "~"}`}
                onDelete={() => onFiltersChange({ ...filters, annual_revenue: { min: null, max: null } })}
                sx={{ bgcolor: "rgba(0, 184, 217, 0.08)", color: "#006C9C" }}
              />
            )}
            {(filters.employees.min !== null || filters.employees.max !== null) && (
              <Chip
                size="small"
                label={`Employees: ${filters.employees.min ?? "~"} - ${filters.employees.max ?? "~"}`}
                onDelete={() => onFiltersChange({ ...filters, employees: { min: null, max: null } })}
                sx={{ bgcolor: "rgba(255, 86, 48, 0.08)", color: "#B71D18" }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}


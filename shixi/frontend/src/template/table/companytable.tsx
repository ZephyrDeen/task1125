"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";

interface CompanyRow {
  company_code: string;
  company_name: string;
  level: string;
  country: string;
  annual_revenue: number | string;
  city?: string;
  founded_year?: number | string;
  employees?: number | string;
}

type Order = "asc" | "desc";
type OrderBy = "company_code" | "company_name" | "level" | "country" | "annual_revenue";

// Generate avatar color from name
function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#00AB55", "#7635DC", "#2065D1", "#FF5630", "#FFC107", "#00B8D9"];
  return colors[Math.abs(hash) % colors.length];
}

// Level chip colors
function getLevelStyle(level: string) {
  switch (level) {
    case "1":
      return { bgcolor: "rgba(34,197,94,0.16)", color: "#118D57" };
    case "2":
      return { bgcolor: "rgba(32,101,209,0.16)", color: "#1939B7" };
    case "3":
      return { bgcolor: "rgba(255,171,0,0.16)", color: "#B76E00" };
    default:
      return { bgcolor: "rgba(145,158,171,0.16)", color: "#637381" };
  }
}

// Format revenue
function formatRevenue(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
}

// Row component
interface RowProps {
  row: CompanyRow & { id: string };
  dense: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function Row({ row, dense, selected, onSelect, onDelete }: RowProps) {
  const [open, setOpen] = React.useState(false);
  const levelStyle = getLevelStyle(row.level);

  return (
    <React.Fragment>
      <TableRow
        hover
        sx={{
          "& > *": { borderBottom: "1px dashed rgba(145,158,171,0.2)" },
          "&:hover": { bgcolor: "rgba(145,158,171,0.08)" },
          bgcolor: selected ? "rgba(0,171,85,0.08)" : "inherit",
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={() => onSelect(row.id)}
            sx={{
              color: "#919EAB",
              "&.Mui-checked": { color: "#00AB55" },
            }}
          />
        </TableCell>
        <TableCell sx={{ width: 48, p: 1 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen((prev) => !prev)}
            sx={{ color: "#637381" }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ py: dense ? 1 : 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: stringToColor(row.company_name || ""),
                width: 40,
                height: 40,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: "#212B36" }}>
                {row.company_name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#919EAB" }}>
                {row.company_code}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>
          <Chip
            label={`Level ${row.level}`}
            size="small"
            sx={{
              ...levelStyle,
              fontWeight: 600,
              fontSize: 12,
              height: 24,
              borderRadius: 1,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: "#212B36" }}>
            {row.country}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600} sx={{ color: "#212B36" }}>
            {formatRevenue(row.annual_revenue)}
          </Typography>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" sx={{ color: "#637381" }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#FF5630", "&:hover": { bgcolor: "rgba(255,86,48,0.08)" } }}
              onClick={() => onDelete(row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Collapse row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                m: 2,
                p: 2,
                bgcolor: "#F4F6F8",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: "#212B36" }}>
                Company Details
              </Typography>
              <Stack direction="row" spacing={6} flexWrap="wrap">
                <Box>
                  <Typography variant="caption" sx={{ color: "#919EAB" }}>
                    City
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: "#212B36" }}>
                    {row.city ?? "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#919EAB" }}>
                    Founded Year
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: "#212B36" }}>
                    {row.founded_year ?? "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#919EAB" }}>
                    Employees
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: "#212B36" }}>
                    {row.employees?.toLocaleString() ?? "-"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function descendingComparator(a: CompanyRow, b: CompanyRow, orderBy: OrderBy): number {
  const aVal = a[orderBy];
  const bVal = b[orderBy];

  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  if (typeof aVal === "number" && typeof bVal === "number") {
    return bVal - aVal;
  }

  return String(bVal).localeCompare(String(aVal));
}

function getComparator(order: Order, orderBy: OrderBy) {
  return order === "desc"
    ? (a: CompanyRow, b: CompanyRow) => descendingComparator(a, b, orderBy)
    : (a: CompanyRow, b: CompanyRow) => -descendingComparator(a, b, orderBy);
}

interface CompanyTableProps {
  levelFilter?: string;
}

export default function CompanyTable({ levelFilter = "All" }: CompanyTableProps) {
  const [rows, setRows] = React.useState<(CompanyRow & { id: string })[]>([]);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<OrderBy>("company_name");
  const [dense, setDense] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | "selected" | null>(null);

  // Fetch companies from JSON (simulating backend API)
  React.useEffect(() => {
    fetch("/companies.json")
      .then((res) => res.json())
      .then((data: CompanyRow[]) => {
        const initialRows = data.map((company) => ({
          ...company,
          id: company.company_code,
        }));
        setRows(initialRows);
      })
      .catch(console.error);
  }, []);

  const filteredRows = React.useMemo(() => {
    return rows.filter((company) => {
      const matchesQuery = company.company_name?.toLowerCase().includes(query.trim().toLowerCase());
      const levelValue = levelFilter.replace("Level ", "");
      const matchesLevel = levelFilter === "All" || company.level === levelValue;
      return matchesQuery && matchesLevel;
    });
  }, [rows, query, levelFilter]);

  const sortedRows = React.useMemo(() => {
    const stabilized = [...filteredRows];
    stabilized.sort(getComparator(order, orderBy));
    return stabilized;
  }, [filteredRows, order, orderBy]);

  const pagedRows = React.useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: OrderBy) => {
    setOrder((prev) => (orderBy === property && prev === "asc" ? "desc" : "asc"));
    setOrderBy(property);
  };

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(pagedRows.map((row) => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete handlers
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget("selected");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget === "selected") {
      const idsToDelete = new Set(selectedIds);
      setRows((prev) => prev.filter((row) => !idsToDelete.has(row.id)));
      setSelectedIds([]);
    } else if (deleteTarget) {
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget));
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const headCells: { id: OrderBy; label: string; width?: number }[] = [
    { id: "company_name", label: "Company" },
    { id: "level", label: "Level", width: 120 },
    { id: "country", label: "Country", width: 140 },
    { id: "annual_revenue", label: "Annual Revenue", width: 160 },
  ];

  const isAllSelected = pagedRows.length > 0 && pagedRows.every((row) => selectedIds.includes(row.id));
  const isSomeSelected = pagedRows.some((row) => selectedIds.includes(row.id)) && !isAllSelected;
  const deleteCount = deleteTarget === "selected" ? selectedIds.length : 1;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search companies..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#919EAB" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            maxWidth: 320,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#fff",
              "& fieldset": { borderColor: "rgba(145,158,171,0.32)" },
            },
          }}
        />
        <Typography variant="body2" sx={{ color: "#919EAB" }}>
          {sortedRows.length} companies found
        </Typography>
      </Stack>

      {/* Bulk delete button */}
      {selectedIds.length > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "rgba(255,86,48,0.08)",
            borderRadius: 1,
            mb: 1,
          }}
        >
          <Typography variant="body2" fontWeight={600} sx={{ color: "#B71D18" }}>
            {selectedIds.length} selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDeleteClick}
            sx={{ borderRadius: 1 }}
          >
            Delete
          </Button>
        </Stack>
      )}

      <TableContainer>
        <Table size={dense ? "small" : "medium"}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "#F4F6F8",
                "& th": {
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#637381",
                  borderBottom: "none",
                },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isSomeSelected}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  sx={{
                    color: "#919EAB",
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#00AB55" },
                  }}
                />
              </TableCell>
              <TableCell sx={{ width: 48 }} />
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id}
                  sortDirection={orderBy === cell.id ? order : false}
                  sx={{ width: cell.width }}
                >
                  <TableSortLabel
                    active={orderBy === cell.id}
                    direction={orderBy === cell.id ? order : "asc"}
                    onClick={() => handleRequestSort(cell.id)}
                  >
                    {cell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ width: 100 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.map((row) => (
              <Row
                key={row.id}
                row={row}
                dense={dense}
                selected={selectedIds.includes(row.id)}
                onSelect={handleSelectOne}
                onDelete={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, borderTop: "1px dashed rgba(145,158,171,0.2)" }}
      >
        <Stack direction="row" alignItems="center">
          <Switch size="small" checked={dense} onChange={(e) => setDense(e.target.checked)} />
          <Typography variant="body2" sx={{ color: "#637381" }}>
            Dense
          </Typography>
        </Stack>
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: "none",
            "& .MuiTablePagination-root": { color: "#637381" },
          }}
        />
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#212B36" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#637381" }}>
            Are you sure you want to delete {deleteCount} company{deleteCount > 1 ? "ies" : ""}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              color: "#212B36",
              borderRadius: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 1 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

"use client";

import * as React from "react";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import users from "@/public/users.json";
import UserEditModal, { UserData } from "@/src/components/UserEditModal";

const initialRows: UserData[] = users.map((user, index) => ({
  id: Number(user.id ?? index + 1),
  name: user.name,
  email: user.email,
  phone_number: user.phone_number,
  country: (user as UserData).country || "",
  state: (user as UserData).state || "",
  city: (user as UserData).city || "",
  address: (user as UserData).address || "",
  zip_code: (user as UserData).zip_code || "",
  company: user.company,
  role: user.role,
  status: user.status,
}));

const paginationModel = { page: 0, pageSize: 5 };

interface DataTableProps {
  statusFilter?: string;
  roleFilter?: string;
  searchValue?: string;
}

// Generate avatar color from name
function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#00AB55", "#7635DC", "#2065D1", "#FF5630", "#FFC107", "#00B8D9"];
  return colors[Math.abs(hash) % colors.length];
}

export default function DataTable({
  statusFilter = "All",
  roleFilter = "all",
  searchValue = "",
}: DataTableProps) {
  const [rows, setRows] = React.useState<UserData[]>(initialRows);
  const [dense, setDense] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserData | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<GridRowId[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<number | "selected" | null>(null);

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (updatedUser: UserData) => {
    setRows((prev) =>
      prev.map((row) => (row.id === updatedUser.id ? updatedUser : row))
    );
  };

  // Delete handlers
  const handleDeleteClick = (id: number) => {
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
      const idsToDelete = new Set(selectedIds.map((id) => Number(id)));
      setRows((prev) => prev.filter((row) => !idsToDelete.has(row.id)));
      setSelectedIds([]);
    } else if (typeof deleteTarget === "number") {
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget));
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const columns = React.useMemo<GridColDef<UserData>[]>(() => {
    return [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 220,
        renderCell: (params) => (
          <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
            <Avatar
              sx={{
                bgcolor: stringToColor(params.row.name || ""),
                width: 40,
                height: 40,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {params.row.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: "#212B36" }}>
                {params.row.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#919EAB" }}>
                {params.row.email}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "phone_number",
        headerName: "Phone number",
        width: 160,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "#212B36" }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "company",
        headerName: "Company",
        width: 200,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "#212B36" }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "role",
        headerName: "Role",
        width: 160,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "#212B36" }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => {
          const status = params.value as string;
          let bgcolor = "rgba(145,158,171,0.16)";
          let color = "#637381";

          if (status === "Active") {
            bgcolor = "rgba(34,197,94,0.16)";
            color = "#118D57";
          } else if (status === "Pending") {
            bgcolor = "rgba(255,171,0,0.16)";
            color = "#B76E00";
          } else if (status === "Banned") {
            bgcolor = "rgba(255,86,48,0.16)";
            color = "#B71D18";
          } else if (status === "Rejected") {
            bgcolor = "rgba(145,158,171,0.16)";
            color = "#637381";
          }

          return (
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor,
                color,
                fontWeight: 600,
                fontSize: 12,
                height: 24,
                borderRadius: 1,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        width: 100,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{ color: "#637381" }}
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(params.row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#FF5630", "&:hover": { bgcolor: "rgba(255,86,48,0.08)" } }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(params.row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ];
  }, []);

  const filteredRows = React.useMemo(() => {
    return rows.filter((user) => {
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesQuery =
        !searchValue ||
        user.name?.toLowerCase().includes(searchValue.trim().toLowerCase()) ||
        user.email?.toLowerCase().includes(searchValue.trim().toLowerCase());
      return matchesStatus && matchesRole && matchesQuery;
    });
  }, [rows, searchValue, statusFilter, roleFilter]);

  const deleteCount = deleteTarget === "selected" ? selectedIds.length : 1;

  return (
    <Box sx={{ width: "100%" }}>
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

      <DataGrid
        rows={filteredRows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
        rowHeight={dense ? 52 : 72}
        onRowSelectionModelChange={(newSelection) => {
          const ids = Array.isArray(newSelection) ? newSelection : [...newSelection.ids];
          setSelectedIds(ids);
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#F4F6F8",
            borderRadius: 0,
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: 14,
              color: "#637381",
            },
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px dashed rgba(145,158,171,0.2)",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "rgba(145,158,171,0.08)",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px dashed rgba(145,158,171,0.2)",
          },
          "& .MuiTablePagination-root": {
            color: "#637381",
          },
        }}
      />
      <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1 }}>
        <Switch
          size="small"
          checked={dense}
          onChange={(e) => setDense(e.target.checked)}
        />
        <Typography variant="body2" sx={{ color: "#637381" }}>
          Dense
        </Typography>
      </Stack>

      {/* Edit Modal */}
      <UserEditModal
        open={modalOpen}
        user={editingUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

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
            Are you sure you want to delete {deleteCount} user{deleteCount > 1 ? "s" : ""}?
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

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import users from '@/public/users.json';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 180 },
  { field: 'email', headerName: 'Email', width: 220 },
  { field: 'phone_number', headerName: 'Phone', width: 160 },
  { field: 'company', headerName: 'Company', width: 220 },
  { field: 'role', headerName: 'Role', width: 160 },
  { field: 'status', headerName: 'Status', width: 140 },
];

const rows = users.map((user, index) => ({
  ...user,
  id: Number(user.id ?? index + 1),
}));

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable() {
  const [query, setQuery] = React.useState('');
  const filteredRows = React.useMemo(
    () =>
      rows.filter((user) =>
        user.name?.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <TextField
        label="Search by name"
        variant="outlined"
        size="small"
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ mb: 2 }}
      />
      <DataGrid
        rows={filteredRows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}

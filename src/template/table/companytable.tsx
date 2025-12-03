import * as React from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Paper,
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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import companies from '@/public/company.json';

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
//排序
type Order = 'asc' | 'desc';
type OrderBy =
  | 'company_code'
  | 'company_name'
  | 'level'
  | 'country'
  | 'annual_revenue';

const rows: (CompanyRow & { id: string })[] = (companies as CompanyRow[]).map(
  (company) => ({
    ...company,
    id: company.company_code,
  }),
);

// 单行 + Collapse
function Row({ row }: { row: CompanyRow }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      {/* 主行 */}
      <TableRow hover>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.company_code}</TableCell>
        <TableCell>{row.company_name}</TableCell>
        <TableCell>{row.level}</TableCell>
        <TableCell>{row.country}</TableCell>
        <TableCell>{row.annual_revenue}</TableCell>
      </TableRow>

      {/* Collapse 行 */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Details for {row.company_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1">{row.city ?? '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Founded Year
                  </Typography>
                  <Typography variant="body1">
                    {row.founded_year ?? '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Employees
                  </Typography>
                  <Typography variant="body1">
                    {row.employees ?? '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}


function descendingComparator(
  a: CompanyRow,
  b: CompanyRow,
  orderBy: OrderBy,
): number {
  const aVal = a[orderBy];
  const bVal = b[orderBy];

  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return bVal - aVal;
  }

  return String(bVal).localeCompare(String(aVal));
}

function getComparator(order: Order, orderBy: OrderBy) {
  return order === 'desc'
    ? (a: CompanyRow, b: CompanyRow) => descendingComparator(a, b, orderBy)
    : (a: CompanyRow, b: CompanyRow) => -descendingComparator(a, b, orderBy);
}

export default function CompanyTable() {
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderBy>('company_name');

  // 搜索
  const filteredRows = React.useMemo(
    () =>
      rows.filter((company) =>
        company.company_name
          ?.toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  // 排序
  const sortedRows = React.useMemo(() => {
    const stabilized = [...filteredRows];
    stabilized.sort(getComparator(order, orderBy));
    return stabilized;
  }, [filteredRows, order, orderBy]);

  // 分页
  const pagedRows = React.useMemo(
    () =>
      sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage],
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: OrderBy) => {
    setOrder((prev) =>
      orderBy === property && prev === 'asc' ? 'desc' : 'asc',
    );
    setOrderBy(property);
  };

  return (
    <Paper sx={{ width: '90%', p: 2 }}>
      <TextField
        label="Search by name"
        variant="outlined"
        size="small"
        fullWidth
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {/* 每个可排序列用 TableSortLabel 包一层 */}
              <TableCell sortDirection={orderBy === 'company_code' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'company_code'}
                  direction={orderBy === 'company_code' ? order : 'asc'}
                  onClick={() => handleRequestSort('company_code')}
                >
                  Code
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'company_name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'company_name'}
                  direction={orderBy === 'company_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('company_name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'level' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'level'}
                  direction={orderBy === 'level' ? order : 'asc'}
                  onClick={() => handleRequestSort('level')}
                >
                  Level
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'country' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'country'}
                  direction={orderBy === 'country' ? order : 'asc'}
                  onClick={() => handleRequestSort('country')}
                >
                  Country
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === 'annual_revenue' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'annual_revenue'}
                  direction={orderBy === 'annual_revenue' ? order : 'asc'}
                  onClick={() => handleRequestSort('annual_revenue')}
                >
                  Annual Revenue
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedRows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedRows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}

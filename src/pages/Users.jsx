import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  DeleteOutlined as DeleteIcon,
  VisibilityOutlined as ViewIcon,
  SearchOutlined as SearchIcon,
  ShareOutlined as ShareIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { fetchUsers } from "../auth/session";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

const USERS_PER_PAGE = 8;
// const API_BASE_URL = "http://192.168.137.232:5000";

// Standardize data keys safely
const normalizeUser = (s = {}) => ({
  ...s,
  id:
    s.id ||
    s.user_id ||
    s.uuid ||
    `USR-${Math.random().toString(36).substr(2, 9)}`,
  name: s.name || s.fullName || s.full_name || "Unknown User",
  id_number: s.id_number || s.idNumber || "N/A",
  status: s.status || "Pending",
});

export default function Users() {
  const theme = useTheme();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  // Data Fetching
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers(token);
        const list = data?.user || data || [];
        if (active) setUsers(list.map(normalizeUser));
      } catch (err) {
        if (active) setError(err.message || "Failed to sync users.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [token]);

  // Search Logic
  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.id_number.toLowerCase().includes(q),
    );
  }, [users, query]);

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE,
  );

  return (
    <Box sx={{ p: { xs: 2, md: 2 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ py: 1 }}
            color="text.primary"
          >
            User Management
          </Typography>
          <Typography variant="body2" sx={{ pb: 1 }} color="text.secondary">
            View and manage identity profiles within the system.
          </Typography>
        </Box>
      </Stack>

      {/* Filter Bar */}
      <Stack
        elevation={0}
        spacing={2}
        sx={{
          // p: 2,
          mb: 3,
          // border: "1px solid",
          // borderColor: "divider",
          borderRadius: 3,
        }}
        direction={{ xs: "column", md: "row" }}
      >
        <TextField
          // fullWidth
          variant="outlined"
          placeholder="Search by name or ID number..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />
            ),
          }}
          sx={{
            width: { xs: "100%", md: "70%" },
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/registration")}
          sx={{
            backgroundColor: "black",
            borderRadius: 2,
            px: 3,
            boxShadow: theme.shadows[4],
          }}
        >
          Register User
        </Button>
      </Stack>

      {/* Main Content Area */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          // borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 10, textAlign: "center" }}>
            <CircularProgress size={40} thickness={4} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Fetching secure data...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>System ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ID Number</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={user.photo} sx={{ width: 40, height: 40 }}>
                          {user.name[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {user.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          bgcolor: "grey.100",
                          p: 0.5,
                        }}
                      >
                        {user.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.id_number}</TableCell>

                    <TableCell align="right">
                      <Tooltip title="View Profile">
                        <IconButton
                          onClick={() => setSelectedUser(user)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => setDeleteTarget(user)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <Typography
                sx={{ p: 4, textAlign: "center" }}
                color="text.secondary"
              >
                No matching records found.
              </Typography>
            )}
          </TableContainer>
        )}

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          p={2}
          alignItems="center"
        >
          <Typography variant="caption" color="text.secondary">
            Total Records: {filteredUsers.length}
          </Typography>
          <Pagination
            count={Math.ceil(filteredUsers.length / USERS_PER_PAGE)}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      {/* User Detail Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Profile Intelligence</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Stack spacing={3} sx={{ py: 1 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  src={selectedUser.photo}
                  sx={{
                    width: 100,
                    height: 100,
                    border: "4px solid",
                    borderColor: "primary.light",
                  }}
                >
                  {selectedUser.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedUser.name}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {selectedUser.id_number}
                  </Typography>
                  <Chip
                    label={selectedUser.status}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Stack>

              <Card
                variant="outlined"
                sx={{ bgcolor: "grey.50", borderRadius: 2 }}
              >
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Identity Token
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 2,
                      p: 2,
                      bgcolor: "#fff",
                      borderRadius: 2,
                    }}
                  >
                    <QRCodeCanvas
                      value={selectedUser.qrToken || selectedUser.id}
                      size={180}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button startIcon={<ShareIcon />} variant="outlined">
            Share PDF
          </Button>
          <Button onClick={() => setSelectedUser(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast("")}
        message={toast}
      />
    </Box>
  );
}

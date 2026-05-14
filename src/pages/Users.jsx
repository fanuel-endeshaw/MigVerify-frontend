import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from "@mui/material";

import {
  DeleteOutlined as DeleteIcon,
  VisibilityOutlined as ViewIcon,
  SearchOutlined as SearchIcon,
  ShareOutlined as ShareIcon,
  Add as AddIcon,
} from "@mui/icons-material";

import { deleteUserBackend, fetchUsers } from "../auth/session";
import { useEffect, useMemo, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

const USERS_PER_PAGE = 8;

const normalizeUser = (s = {}) => ({
  ...s,
  id:
    s.id ||
    s.user_id ||
    s.uuid ||
    `USR-${Math.random().toString(36).substr(2, 9)}`,
  name: s.name || s.fullName || s.full_name || "Unknown User",
  id_number: s.id_number ?? s.idNumber ?? "",

  phone_number: s.phone_number ?? "",
});

export default function Users() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState("");

  //  FIX: useRef instead of getElementById
  const qrRef = useRef(null);

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

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;

    try {
      await deleteUserBackend(user.id, token);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setToast("User deleted successfully");
    } catch (err) {
      setToast(err.message || "Delete failed");
    }
  };

  // ✅ FIXED SHARE FUNCTION
  const handleShareQR = async () => {
    const canvas = qrRef.current;

    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "qr-code.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "User QR Code",
          files: [file],
        });
      } else {
        // fallback (desktop)
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${selectedUser?.name || "qr"}-code.png`;
        link.click();

        setToast("Sharing not supported. QR downloaded instead.");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      setToast("Failed to share QR");
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
              letterSpacing: 0.6,
              color: "#004d40",
              fontWeight: 500,
            }}
          >
            User Management
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
              fontWeight: 500,
              fontSize: 18,
            }}
          >
            Manage identity profiles
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{ mt: 1, mb: 1 }}
        spacing={2}
        mb={3}
      >
        <TextField
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ flex: 1 }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/registration")}
          sx={{ background: "#004d40" }}
        >
          Register
        </Button>
      </Stack>

      <Paper>
        {loading ? (
          <Box textAlign="center" sx={{ mt: 1, padding: 2 }}>
            <CircularProgress size={24} sx={{ color: "black" }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        <Avatar>{user.name[0]}</Avatar>
                        <Typography>{user.name}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{user.id_number}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>

                    <TableCell align="right">
                      <IconButton onClick={() => setSelectedUser(user)}>
                        <ViewIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => handleDelete(user)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Stack
          direction="row"
          justifyContent="space-between"
          p={2}
          sx={{ padding: 1, alignItems: "center" }}
        >
          <Typography variant="caption">
            Total: {filteredUsers.length}
          </Typography>

          <Pagination
            count={Math.ceil(filteredUsers.length / USERS_PER_PAGE)}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </Stack>
      </Paper>

      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle fontWeight={800}>User Profile</DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Stack spacing={3} alignItems="center" py={2}>
              <Box
                component={"img"}
                src={selectedUser.photo_url}
                sx={{ width: 170, height: 170 }}
              />

              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedUser.name}
                </Typography>

                <Typography color="text.secondary">
                  {selectedUser.id_number}
                </Typography>
                <Typography color="text.secondary">
                  {selectedUser.phone_number}
                </Typography>
              </Box>

              <Card sx={{ width: "100%" }}>
                <CardContent>
                  <Typography align="center" gutterBottom>
                    Scan QR
                  </Typography>

                  <Typography color="text.secondary">
                    QR Token: {selectedUser.id_number}
                  </Typography>

                  <Box textAlign="center">
                    {selectedUser.id_number ? (
                      <QRCodeCanvas
                        ref={qrRef} //  FIXED
                        value={selectedUser.id_number}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    ) : (
                      <Typography color="error">Missing QR Token</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button startIcon={<ShareIcon />} onClick={handleShareQR}>
            Share QR
          </Button>

          <Button
            variant="contained"
            sx={{ bgcolor: "black" }}
            onClick={() => setSelectedUser(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        message={toast}
        autoHideDuration={4000}
        onClose={() => setToast("")}
      />
    </Box>
  );
}

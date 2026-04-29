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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { fetchUsers } from "../auth/session";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

const usersPerPage = 5;
const apiBaseUrl = "http://192.168.137.232:5000";

function normalizeFetchedUser(source) {
  const s = source || {};
  const id =
    s.id ||
    s.user_id ||
    s.userId ||
    s.uuid ||
    s.id_number ||
    `USR-${Math.random().toString(16).slice(2)}`;

  return {
    ...s,
    id,
    name: s.name || s.full_name || s.fullName || s.user_name || "",
    fullName: s.fullName || s.full_name || s.name || "",
    id_number: s.id_number || s.idNumber || s.idNo || "",
    dateOfBirth: s.dateOfBirth || s.date_of_birth || "",
    address: s.address || "",
    photo: s.photo || s.photoUrl || s.photo_url || "",
    status: s.status || "Pending",
    lastScan: s.lastScan || s.last_scan || "Not scanned yet",
    qrToken: s.qrToken || s.qr_token || "",
    backendManaged: true,
  };
}

export default function Users() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [qrImage, setQrImage] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const [shareMessage, setShareMessage] = useState(() => {
    const msg = sessionStorage.getItem("migVerifyToast");
    if (msg) sessionStorage.removeItem("migVerifyToast");
    return msg || "";
  });

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const loadUsers = async () => {
      setLoadingUsers(true);
      setUsersError("");

      try {
        const data = await fetchUsers(token);
        const list = data?.user || data || [];
        if (mounted) {
          setUsers(
            Array.isArray(list) ? list.map(normalizeFetchedUser) : [],
          );
        }
      } catch (err) {
        if (mounted) setUsersError(err?.message || "Failed to fetch users.");
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [token]);

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((item) => {
      const name = item?.name || item?.fullName || "";
      const idNumber = item?.id_number || "";
      const id = item?.id || "";
      return `${name} ${idNumber} ${id}`.toLowerCase().includes(q);
    });
  }, [users, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage),
  );
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * usersPerPage,
    safePage * usersPerPage,
  );

  useEffect(() => {
    let objectUrl = "";

    const loadQrCode = async () => {
      if (!selectedUser) {
        setQrImage("");
        setQrToken("");
        setQrError("");
        setQrLoading(false);
        return;
      }

      setQrLoading(true);
      setQrError("");
      setQrImage("");
      setQrToken(selectedUser.qrToken || "");

      if (!apiBaseUrl) {
        setQrError("QR asset base URL is not configured.");
        setQrLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/users/${selectedUser.id_number}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to retrieve the QR image from backend.");
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.startsWith("image/")) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setQrImage(objectUrl);
        } else {
          const payload = await response.json();
          setQrImage(payload.image || payload.qrImage || "");
          setQrToken(
            payload.token ||
              payload.qrToken ||
              payload.qr_token ||
              selectedUser.qrToken ||
              "",
          );
          if (!payload.image && !payload.qrImage) {
            setQrError(
              "Backend returned token data only. Rendering QR from token.",
            );
          }
        }
      } catch (error) {
        setQrError(error.message || "QR image could not be loaded.");
      } finally {
        setQrLoading(false);
      }
    };

    loadQrCode();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedUser, token]);

  const handleShareUser = async () => {
    if (!selectedUser) return;

    const shareText = [
      `User: ${selectedUser.name || selectedUser.fullName || "N/A"}`,
      `System ID: ${selectedUser.id || "N/A"}`,
      `ID Number: ${selectedUser.id_number || "N/A"}`,
      qrToken ? `QR Token: ${qrToken}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${selectedUser.name || "User"} identity profile`,
          text: shareText,
        });
        setShareMessage("User details opened in the system share menu.");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareMessage("User details copied. Paste into any platform to share.");
    } catch (error) {
      setShareMessage(error?.message || "Sharing was cancelled.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const idNumber = deleteTarget.id_number;
      const response = await fetch(`${apiBaseUrl}/api/users/${idNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await response
        .json()
        .catch(() => ({ message: "Delete request completed." }));

      if (!response.ok) {
        throw new Error(payload?.message || "Delete action failed.");
      }

      // Best-effort removal from UI.
      setUsers((prev) =>
        prev.filter(
          (entry) =>
            entry.id_number !== idNumber && entry.id !== deleteTarget.id,
        ),
      );

      setShareMessage(payload?.message || "User deleted successfully.");
      setDeleteTarget(null);
    } catch (error) {
      setShareMessage(error?.message || "Delete action failed.");
    }
  };

  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            Users
          </Typography>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              placeholder="Search users by name, system ID, or ID number"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchOutlinedIcon
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/registration")}
            >
              Register New User
            </Button>
          </Stack>
        </Paper>

        <Paper>
          {loadingUsers ? (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 3 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">Loading users...</Typography>
            </Stack>
          ) : usersError ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{usersError}</Alert>
            </Box>
          ) : (
            <>
              <List disablePadding>
                {paginatedUsers.map((entry) => (
                  <Box key={entry.id}>
                    <ListItemButton onClick={() => setSelectedUser(entry)}>
                      <ListItemIcon>
                        <Avatar src={entry.photo || ""}>
                          {(entry.name?.[0] || "U").toString()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={entry.name || entry.fullName || "Unnamed user"}
                        secondary={`${entry.id} • ${
                          entry.id_number || "No ID Number"
                        } • ${entry.status}`}
                      />
                      <Chip
                        size="small"
                        label={entry.status}
                        color={entry.status === "Verified" ? "success" : "warning"}
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedUser(entry);
                        }}
                      >
                        <VisibilityOutlinedIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(entry);
                        }}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </ListItemButton>
                    <Divider />
                  </Box>
                ))}

                {!filteredUsers.length ? (
                  <Box sx={{ p: 3 }}>
                    <Typography color="text.secondary">
                      No users match this filter.
                    </Typography>
                  </Box>
                ) : null}
              </List>

              {filteredUsers.length ? (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Showing {(safePage - 1) * usersPerPage + 1}-
                    {Math.min(
                      safePage * usersPerPage,
                      filteredUsers.length,
                    )}{" "}
                    of{" "}
                    {filteredUsers.length}
                  </Typography>
                  <Pagination
                    page={safePage}
                    count={totalPages}
                    color="primary"
                    onChange={(_, nextPage) => setPage(nextPage)}
                  />
                </Stack>
              ) : null}
            </>
          )}
        </Paper>
      </Stack>

      <Dialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Profile Detail</DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Avatar
                  src={selectedUser.photo || ""}
                  alt={selectedUser.name}
                  sx={{ width: 88, height: 88 }}
                >
                  {(selectedUser.name?.[0] || "U").toString()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedUser.name || selectedUser.fullName || "User"}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedUser.status}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Typography>
                <strong>ID:</strong> {selectedUser.id}
              </Typography>
              <Typography>
                <strong>ID Number:</strong>{" "}
                {selectedUser.id_number || "Not provided"}
              </Typography>
              <Typography>
                <strong>Date of Birth:</strong>{" "}
                {selectedUser.dateOfBirth || "Not provided"}
              </Typography>
              <Typography>
                <strong>Address:</strong>{" "}
                {selectedUser.address || "Not provided"}
              </Typography>
              <Typography>
                <strong>Last Scan:</strong> {selectedUser.lastScan}
              </Typography>

              {selectedUser.photo ? (
                <Box
                  component="img"
                  src={selectedUser.photo}
                  alt={`${selectedUser.name} profile`}
                  sx={{
                    width: "100%",
                    maxHeight: 240,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              ) : null}

              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <QrCode2OutlinedIcon color="primary" />
                      <Typography fontWeight={700}>
                        QR Identity Token
                      </Typography>
                    </Stack>

                    {qrLoading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography color="text.secondary">
                          Loading QR assets...
                        </Typography>
                      </Stack>
                    ) : null}

                    {!qrLoading && qrError ? (
                      <Alert severity="info">{qrError}</Alert>
                    ) : null}

                    {!qrLoading && qrImage ? (
                      <Box
                        component="img"
                        src={qrImage}
                        alt={`${selectedUser.name} QR code from backend`}
                        sx={{
                          width: 220,
                          height: 220,
                          alignSelf: "center",
                          objectFit: "contain",
                          borderRadius: 2,
                          bgcolor: "#fff",
                          border: "1px solid",
                          borderColor: "divider",
                          p: 1,
                        }}
                      />
                    ) : null}

                    {qrToken ? (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          <strong>QR Token:</strong> {qrToken}
                        </Typography>
                        <Stack alignItems="center" spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Generated locally from backend token
                          </Typography>
                          <Box
                            sx={{
                              bgcolor: "#fff",
                              p: 1.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <QRCodeCanvas
                              value={qrToken}
                              size={220}
                              includeMargin
                            />
                          </Box>
                        </Stack>
                      </>
                    ) : null}

                    <Button
                      variant="contained"
                      startIcon={<ShareOutlinedIcon />}
                      onClick={handleShareUser}
                    >
                      Share User Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(shareMessage)}
        autoHideDuration={3000}
        onClose={() => setShareMessage("")}
        message={shareMessage}
      />
    </>
  );
}


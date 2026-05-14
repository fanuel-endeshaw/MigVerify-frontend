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
  EditOutlined as EditIcon,
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

const outfitFont = {
  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
};

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

  // ✅ UPDATE ACTION
  const handleUpdate = (user) => {
    navigate(`/dashboard/userManagment/${user.id}`, {
      state: user,
    });
  };

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
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        mx: "auto",
        ...outfitFont,
      }}
    >
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography
            variant="h4"
            // sx={{
            //   ...outfitFont,
            //   letterSpacing: 0.6,
            //   color: "#004d40",
            //   fontWeight: 700,
            // }}
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
              ...outfitFont,
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
            sx: {
              ...outfitFont,
            },
          }}
          sx={{
            flex: 1,
            "& input": {
              ...outfitFont,
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/userManagment")}
          sx={{
            background: "#004d40",
            ...outfitFont,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Register
        </Button>
      </Stack>

      <Paper
        sx={{
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box textAlign="center" sx={{ mt: 1, padding: 2 }}>
            <CircularProgress size={24} sx={{ color: "black" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={outfitFont}>
            {error}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      ...outfitFont,
                      fontWeight: 700,
                    }}
                  >
                    User
                  </TableCell>

                  <TableCell sx={outfitFont}>Employee ID</TableCell>

                  <TableCell sx={outfitFont}>Phone Number</TableCell>

                  <TableCell align="right" sx={outfitFont}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: "#004d40",
                            ...outfitFont,
                          }}
                        >
                          {user.name[0]}
                        </Avatar>

                        <Typography
                          sx={{
                            ...outfitFont,
                            fontWeight: 500,
                          }}
                        >
                          {user.name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={outfitFont}>{user.id_number}</TableCell>

                    <TableCell sx={outfitFont}>{user.phone_number}</TableCell>

                    <TableCell align="right">
                      <IconButton onClick={() => setSelectedUser(user)}>
                        <ViewIcon />
                      </IconButton>

                      {/* ✅ UPDATE BUTTON */}
                      <IconButton
                        onClick={() => handleUpdate(user)}
                        sx={{
                          color: "#004d40",
                        }}
                      >
                        <EditIcon />
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
          sx={{
            padding: 1,
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              ...outfitFont,
              fontWeight: 500,
            }}
          >
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
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle
          sx={{
            ...outfitFont,
            fontWeight: 700,
          }}
        >
          User Profile
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Stack spacing={3} alignItems="center" py={2}>
              <Box
                component={"img"}
                src={selectedUser.photo_url}
                sx={{
                  width: 170,
                  height: 170,
                  borderRadius: 3,
                  objectFit: "cover",
                }}
              />

              <Box textAlign="center">
                <Typography
                  variant="h5"
                  sx={{
                    ...outfitFont,
                    fontWeight: 700,
                  }}
                >
                  {selectedUser.name}
                </Typography>

                <Typography color="text.secondary" sx={outfitFont}>
                  {selectedUser.id_number}
                </Typography>

                <Typography color="text.secondary" sx={outfitFont}>
                  {selectedUser.phone_number}
                </Typography>
              </Box>

              <Card
                sx={{
                  width: "100%",
                  borderRadius: 4,
                }}
              >
                <CardContent>
                  <Typography
                    align="center"
                    gutterBottom
                    sx={{
                      ...outfitFont,
                      fontWeight: 600,
                    }}
                  >
                    Scan QR
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      ...outfitFont,
                      mb: 2,
                    }}
                  >
                    QR Token: {selectedUser.id_number}
                  </Typography>

                  <Box textAlign="center">
                    {selectedUser.id_number ? (
                      <QRCodeCanvas
                        ref={qrRef}
                        value={selectedUser.id_number}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    ) : (
                      <Typography color="error" sx={outfitFont}>
                        Missing QR Token
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShareQR}
            sx={{
              ...outfitFont,
              textTransform: "none",
              color: "#004d40",
              fontWeight: 600,
            }}
          >
            Share QR
          </Button>

          <Button
            variant="contained"
            sx={{
              bgcolor: "#004d40",
              ...outfitFont,
              textTransform: "none",
              fontWeight: 600,
            }}
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

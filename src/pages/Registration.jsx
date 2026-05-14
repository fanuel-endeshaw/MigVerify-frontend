import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

const apiBaseUrl = "http://192.168.1.53:5000";

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const { token } = useAuth();

  const isEditMode = !!id;
  const editUser = location.state;

  const fileInputRef = useRef(null);

  const [registrationError, setRegistrationError] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    id_number: "",
    phone_number: "",
    address: "",
    photo: "",
    photoFile: null,
  });

  // ✅ LOAD USER DATA IN EDIT MODE
  useEffect(() => {
    if (isEditMode && editUser) {
      setForm({
        fullName: editUser.name || "",
        id_number: editUser.id_number || "",
        phone_number: editUser.phone_number || "",
        address: editUser.address || "",
        photo: editUser.photo_url || "",
        photoFile: null,
      });
    }
  }, [isEditMode, editUser]);

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // ✅ RESET FORM
  const handleReset = () => {
    setRegistrationError("");

    setForm({
      fullName: "",
      id_number: "",
      phone_number: "",
      address: "",
      photo: "",
      photoFile: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ PHOTO UPLOAD
  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result,
        photoFile: file,
      }));
    };

    reader.readAsDataURL(file);
  };

  // ✅ CREATE / UPDATE USER
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!isEditMode && !form.photoFile) {
      setRegistrationError("Please upload a profile photo.");
      return;
    }

    setRegistrationLoading(true);
    setRegistrationError("");

    try {
      const payload = new FormData();

      payload.append("full_name", form.fullName);
      payload.append("id_number", form.id_number);
      payload.append("phone_number", form.phone_number);
      payload.append("address", form.address);

      // only append photo if selected
      if (form.photoFile) {
        payload.append("photo", form.photoFile);
      }

      const endpoint = isEditMode
        ? `${apiBaseUrl}/api/users/update/${id}`
        : `${apiBaseUrl}/api/users/register`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json().catch(() => null);
      if (isEditMode) {
        alert(data.message);
      }

      if (!res.ok) {
        throw new Error(data?.message || "Request failed");
      }

      navigate("/dashboard/users");
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      <Box sx={{ maxWidth: 900 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
            letterSpacing: 0.6,
            color: "#004d40",
            fontWeight: 500,
          }}
          mb={3}
        >
          {isEditMode ? "Update User" : "New User Registration"}
        </Typography>

        <Box component="form" sx={{ mt: 2 }} onSubmit={handleCreateUser}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="stretch"
          >
            {/* LEFT FORM */}
            <Paper
              sx={{
                flex: 7,
                p: 3,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                {registrationError && (
                  <Alert
                    severity="error"
                    sx={{
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    {registrationError}
                  </Alert>
                )}

                <TextField
                  label="Full Name"
                  required
                  fullWidth
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  InputLabelProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                  InputProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                />

                <TextField
                  label="Employee ID"
                  required
                  fullWidth
                  value={form.id_number}
                  onChange={handleChange("id_number")}
                  InputLabelProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                  InputProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                />

                <TextField
                  label="Phone Number"
                  fullWidth
                  value={form.phone_number}
                  onChange={handleChange("phone_number")}
                  InputLabelProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                  InputProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                />

                <TextField
                  multiline
                  rows={4}
                  label="Address"
                  fullWidth
                  value={form.address}
                  onChange={handleChange("address")}
                  InputLabelProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                  InputProps={{
                    sx: {
                      fontFamily: '"Outfit", sans-serif',
                    },
                  }}
                />

                <Box mt="auto">
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleReset}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        color: "#004d40",
                        borderColor: "#004d40",
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      Clear
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={registrationLoading}
                      startIcon={
                        registrationLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isEditMode ? (
                          <EditOutlinedIcon />
                        ) : (
                          <PersonAddAlt1Icon />
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        backgroundColor: "#004d40",
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      {registrationLoading
                        ? "Processing..."
                        : isEditMode
                          ? "Update User"
                          : "Complete"}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* RIGHT PHOTO */}
            <Paper
              sx={{
                flex: 5,
                p: 3,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                mb={2}
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 500,
                }}
              >
                Employee Photo
              </Typography>

              <Box
                sx={{
                  flexGrow: 1,
                  border: "2px dashed #cbd5e1",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  minHeight: 250,
                  overflow: "hidden",
                }}
              >
                {form.photo ? (
                  <Box
                    component="img"
                    src={form.photo}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UploadFileOutlinedIcon
                    sx={{
                      fontSize: 50,
                      color: "#004d40",
                    }}
                  />
                )}
              </Box>

              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{
                  color: "#004d40",
                  borderColor: "#004d40",
                  textTransform: "none",
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 600,
                }}
                startIcon={<UploadFileOutlinedIcon />}
              >
                {isEditMode ? "Change Photo" : "Upload Photo"}

                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Button>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

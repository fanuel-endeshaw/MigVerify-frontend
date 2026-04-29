import {
  Alert,
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const apiBaseUrl = "http://192.168.1.56:5000";

export default function Registration() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [registrationError, setRegistrationError] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    id_number: "",
    dateOfBirth: "",
    address: "",
    photo: "",
    photoFile: null,
  });

  const resetRegistrationForm = () => {
    setRegistrationError("");
    setForm({
      fullName: "",
      id_number: "",
      dateOfBirth: "",
      address: "",
      photo: "",
      photoFile: null,
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!form.photoFile) {
      setRegistrationError("Please upload a profile photo before submitting.");
      return;
    }

    setRegistrationError("");
    setRegistrationLoading(true);

    try {
      const payload = new FormData();
      payload.append("full_name", form.fullName);
      payload.append("id_number", form.id_number);
      payload.append("date_of_birth", form.dateOfBirth);
      payload.append("address", form.address);
      if (form.photoFile) payload.append("photo", form.photoFile);

      const response = await fetch(`${apiBaseUrl}/api/users/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const payloadJson = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payloadJson?.message || "Registration failed.");
      }

      sessionStorage.setItem("migVerifyToast", "User registered successfully.");
      resetRegistrationForm();
      navigate("/dashboard/users");
    } catch (error) {
      setRegistrationError(error?.message || "Registration failed.");
    } finally {
      setRegistrationLoading(false);
    }
  };

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

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {/* Header - Left Aligned */}
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
          New User Registration
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Complete the fields below to register a new identity in the system.
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleCreateUser}>
        <Grid container spacing={3}>
          {/* Left Column: Main Form Data */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Personal Details
              </Typography>

              {registrationError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {registrationError}
                </Alert>
              )}

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    required
                    fullWidth
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ID Number"
                    required
                    fullWidth
                    value={form.id_number}
                    onChange={(e) =>
                      setForm({ ...form, id_number: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
                        {
                          color: form.dateOfBirth ? "inherit" : "transparent",
                        },
                    }}
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      setForm({ ...form, dateOfBirth: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Full Address"
                    required
                    fullWidth
                    multiline
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column: Photo & Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Photo Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 2, textAlign: "left" }}
                >
                  Profile Photo
                </Typography>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    src={form.photo}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      border: "2px solid",
                      borderColor: "primary.main",
                      bgcolor: "grey.50",
                    }}
                  >
                    {!form.photo && (
                      <UploadFileOutlinedIcon
                        sx={{ fontSize: 40, color: "text.disabled" }}
                      />
                    )}
                  </Avatar>
                </Box>

                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={<UploadFileOutlinedIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {form.photo ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoUpload}
                  />
                </Button>
              </Paper>

              {/* Action Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "grey.50",
                }}
              >
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={registrationLoading}
                    startIcon={
                      registrationLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <PersonAddAlt1Icon />
                      )
                    }
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    {registrationLoading
                      ? "Processing..."
                      : "Complete Registration"}
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={resetRegistrationForm}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Discard Changes
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

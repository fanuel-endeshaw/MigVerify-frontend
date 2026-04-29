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
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
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

  const buildHeaders = (extraHeaders = {}) => ({
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  });

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
        headers: buildHeaders(),
        body: payload,
      });

      const payloadJson = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payloadJson?.message || payloadJson?.error || "Registration failed.",
        );
      }

      sessionStorage.setItem(
        "migVerifyToast",
        payloadJson?.message || "User registered successfully.",
      );

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

  const handleClearRegistration = () => {
    resetRegistrationForm();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        New User Registration
      </Typography>
      <Typography color="text.secondary">
        Capture complete identity details in a secure and professional intake
        workflow.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={handleCreateUser}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            // bgcolor: "#f5f5f5",
            borderRadius: 2,
            p: 3,
          }}
        >
          {registrationError ? (
            <Alert severity="warning">{registrationError}</Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                required
                fullWidth
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="ID Number"
                required
                fullWidth
                value={form.id_number}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    id_number: event.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Birth"
                type="date"
                required
                fullWidth
                sx={{
                  "&input::-webkit-datetime-edit-*-field:not([aria-valuenow])":
                    {
                      color: "transparent",
                    },
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ placeholder: " hello" }}
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: event.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                required
                fullWidth
                multiline
                minRows={3}
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<UploadFileOutlinedIcon />}
                sx={{
                  height: "56px",
                  justifyContent: "flex-start",
                  pl: 2,
                }}
              >
                {form.photo ? "Photo Selected" : "Upload Photo (File)"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                />
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              {form.photo ? (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={form.photo}
                    alt={form.fullName || "User photo"}
                  />
                  <Typography color="text.secondary" variant="body2">
                    Photo attached and ready for submission.
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No photo uploaded yet.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleClearRegistration}>
                  Clear
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={registrationLoading}
                >
                  {registrationLoading
                    ? "Submitting..."
                    : "Submit Registration"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Stack>
  );
}

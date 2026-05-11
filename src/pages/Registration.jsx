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
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const apiBaseUrl = "http://192.168.1.53:5000";

export default function Registration() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const fileInputRef = useRef(null);

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
      dateOfBirth: "",
      address: "",
      photo: "",
      photoFile: null,
    });

    // ✅ IMPORTANT FIX
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

  // ✅ SUBMIT
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!form.photoFile) {
      setRegistrationError("Please upload a profile photo.");
      return;
    }

    setRegistrationLoading(true);
    setRegistrationError("");

    try {
      const payload = new FormData();

      payload.append("full_name", form.fullName);
      payload.append("id_number", form.id_number);
      payload.append("date_of_birth", form.dateOfBirth);
      payload.append("address", form.address);
      payload.append("photo", form.photoFile);

      const res = await fetch(`${apiBaseUrl}/api/users/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      navigate("/dashboard/users");
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ maxWidth: 900 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          New User Registration
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
                  <Alert severity="error">{registrationError}</Alert>
                )}

                <TextField
                  label="Full Name"
                  required
                  fullWidth
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                />

                <TextField
                  label="Employee ID"
                  required
                  fullWidth
                  value={form.id_number}
                  onChange={handleChange("id_number")}
                />

                <TextField
                  type="date"
                  label="Date of Birth"
                  fullWidth
                  value={form.dateOfBirth}
                  sx={{
                    // 1. Hide the placeholder text when not focused and empty
                    "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
                      {
                        color: form.dateOfBirth ? "inherit" : "transparent",
                      },
                    // 2. Show the placeholder text when focused
                    "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
                      {
                        color: "inherit",
                      },
                  }}
                  onChange={handleChange("dateOfBirth")}
                />

                <TextField
                  multiline
                  rows={4}
                  label="Address"
                  fullWidth
                  value={form.address}
                  onChange={handleChange("address")}
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
                        borderColor: "grey.400",
                        color: "text.secondary",
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
                        ) : (
                          <PersonAddAlt1Icon />
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        backgroundColor: "black",
                      }}
                    >
                      {registrationLoading ? "Processing..." : "Complete"}
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
              <Typography mb={2}>Employee Photo</Typography>

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
                  <UploadFileOutlinedIcon sx={{ fontSize: 50 }} />
                )}
              </Box>

              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{ borderColor: "black", color: "black" }}
                startIcon={<UploadFileOutlinedIcon />}
              >
                Upload Photo
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

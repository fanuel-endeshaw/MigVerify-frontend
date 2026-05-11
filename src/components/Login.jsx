import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import midrocLogo from "../assets/midroc_logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        // background: "green",
        background: "linear-gradient(180deg, #F5F8FF 0%, #ECF1FF 100%)",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {/* <ShieldOutlinedIcon color="primary" />
             */}
            <img
              src={midrocLogo}
              alt="Midroc Logo"
              style={{ width: 120, height: 60 }}
            ></img>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
                letterSpacing: 0.4,
              }}
            >
              MIG ID Verification
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Sign in to manage registrations and user identity records.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
              <TextField
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: "black" }}
                disabled={loading}
                size="large"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>
          {/* <Typography variant="caption" color="text.secondary">
            Demo credentials are prefilled.
          </Typography> */}
        </Stack>
      </Paper>
    </Box>
  );
}

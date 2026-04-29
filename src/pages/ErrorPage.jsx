import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            Page Not Found
          </Typography>
          <Typography color="text.secondary">
            The page you're looking for doesn't exist.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}


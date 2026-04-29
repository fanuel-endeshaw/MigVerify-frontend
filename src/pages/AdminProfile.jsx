import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function AdminProfile() {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Admin Profile
        </Typography>
        <Typography color="text.secondary">
          Access identity and account details for the signed-in administrator.
        </Typography>

        <Divider />

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: 24,
            }}
          >
            A
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Admin User
            </Typography>
            <Typography color="text.secondary">admin@idverify.io</Typography>
          </Box>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Role
                </Typography>
                <Typography fontWeight={700}>System Administrator</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Access Level
                </Typography>
                <Typography fontWeight={700}>Full Privileges</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}


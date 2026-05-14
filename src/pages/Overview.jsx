import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchCount, fetchUsers } from "../auth/session";
import { useAuth } from "../auth/useAuth";

export default function Overview() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [todayScans, setTodayScans] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchUsers(token);
        const list = data?.user || data || [];
        if (mounted) setUsers(list);
        const data2 = await fetchCount(token);
        console.log("count");
        setTodayScans(data2);
        console.log(data2);
        console.log("count");
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load overview data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [token]);

  // const todayScans = useMemo(
  //   () => users.reduce((total, item) => total + (item.scans || 0), 0),
  //   [users],
  // );

  const totalUsers = users.length;

  return (
    <Stack spacing={3} sx={{ justifyContent: "center", alignItems: "center" }}>
      <Typography
        variant="h4"
        fontWeight={600}
        sx={{
          fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
          letterSpacing: 0.6,
          color: "#004d40",
          fontWeight: 500,
        }}
      >
        System Overview
      </Typography>

      {loading ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Loading...</Typography>
        </Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          {[
            { label: "Total Employees", value: totalUsers || 0 },
            { label: "Today Scans", value: todayScans || 0 },
            // Future cards can be added here.
          ].map((card) => (
            <Grid key={card.label} xs={12} sm={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">{card.label}</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchCount, fetchUsers } from "../auth/session";
import { useAuth } from "../auth/useAuth";

export default function Overview() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [todayScans, setTodayScans] = useState(0);
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

        // const data2 = await fetchCount(token);

        // console.log(data2);

        // setTodayScans(data2);
        const data2 = await fetchCount(token);

        // console.log("TODAY SCANS:", data2);

        // handle different API response structures
        const count = data2 ?? data2?.todayScans ?? data2?.total ?? 0;

        setTodayScans(Number(count));
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
          <CircularProgress color="#004d40" size={24} />
          <Typography
            color="text.secondary"
            sx={{ fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif' }}
          >
            Loading...
          </Typography>
        </Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          {[
            { label: "Total Employees", value: totalUsers || 0 },
            { label: "Today Scans", value: todayScans || 0 },
            // check
            // future cards can be added .
          ].map((card) => (
            <Grid key={card.label} xs={12} sm={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                    }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                      fontWeight: 700,
                    }}
                  >
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

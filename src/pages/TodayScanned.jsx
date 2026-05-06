import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Pagination,
  Stack,
  Alert,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

const ROWS_PER_PAGE = 6;

export default function TodayScanned() {
  const { token } = useAuth();

  const [data, setData] = useState([]); // ✅ start empty
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // ==========================
  // FETCH FROM BACKEND
  // ==========================
  useEffect(() => {
    let active = true;

    const fetchScanned = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "http://192.168.137.232:5000/api/history/today-scans",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await res.json();
        console.log(result);

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch");
        }

        const normalized = (result.users || result || []).map((s, i) => ({
          id: s.id || i,
          full_name: s.full_name || s.name || "Unknown",
          id_number: s.id_number || "N/A",
          verified_at: s.verified_at || s.created_at || "-",
        }));

        if (active) setData(normalized);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchScanned();
    return () => (active = false);
  }, [token]);

  // ==========================
  // PAGINATION
  // ==========================
  const paginatedData = useMemo(() => {
    return data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  }, [data, page]);

  // ==========================
  // UI
  // ==========================
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Today Scanned Users
      </Typography>

      <Paper>
        {/* ✅ LOADING STATE */}
        {loading && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ padding: 2, mt: 1 }}
            spacing={1}
            p={2}
          >
            <CircularProgress sx={{ color: "black" }} size={18} />
            <Typography variant="caption">Fetching data...</Typography>
          </Stack>
        )}

        {/* ✅ ERROR */}
        {error && (
          <Alert sx={{ padding: 1, mt: 1 }} severity="error">
            {error}
          </Alert>
        )}

        {/* ✅ EMPTY STATE */}
        {!loading && !error && data.length === 0 && (
          <Box textAlign="center" sx={{ padding: 2, mt: 1 }}>
            <Typography color="text.secondary">
              No scans found for today
            </Typography>
          </Box>
        )}

        {/* ✅ TABLE */}
        {!error && data.length > 0 && (
          <>
            <TableContainer sx={{ mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Full Name</b>
                    </TableCell>
                    <TableCell>
                      <b>ID Number</b>
                    </TableCell>
                    <TableCell>
                      <b>Scanned At</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.id_number}</TableCell>
                      <TableCell>{row.verified_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ padding: 1 }}
              alignItems="center"
            >
              <Typography variant="caption">Total: {data.length}</Typography>

              <Pagination
                count={Math.ceil(data.length / ROWS_PER_PAGE)}
                page={page}
                onChange={(_, v) => setPage(v)}
              />
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}

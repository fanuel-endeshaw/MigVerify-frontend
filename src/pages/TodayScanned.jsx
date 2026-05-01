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

// ✅ DEMO DATA (shown before backend loads)
const demoData = [
  {
    id: 1,
    full_name: "John Doe",
    id_number: "ID12345",
    scanned_at: "2026-05-01 10:15 AM",
  },
  {
    id: 2,
    full_name: "Jane Smith",
    id_number: "ID67890",
    scanned_at: "2026-05-01 10:45 AM",
  },
  {
    id: 3,
    full_name: "Michael Brown",
    id_number: "ID54321",
    scanned_at: "2026-05-01 11:10 AM",
  },
  {
    id: 4,
    full_name: "Sarah Johnson",
    id_number: "ID99887",
    scanned_at: "2026-05-01 11:30 AM",
  },
  {
    id: 5,
    full_name: "David Lee",
    id_number: "ID77665",
    scanned_at: "2026-05-01 12:00 PM",
  },
];

export default function TodayScanned() {
  const { token } = useAuth();

  const [data, setData] = useState(demoData); // ✅ start with demo
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

        const res = await fetch("http://192.168.1.56:5000/api/scans/today", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch");
        }

        // ✅ normalize backend data
        const normalized = (result.data || result || []).map((s, i) => ({
          id: s.id || i,
          full_name: s.full_name || s.name || "Unknown",
          id_number: s.id_number || "N/A",
          scanned_at: s.scanned_at || s.created_at || "-",
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Today Scanned Users
      </Typography>

      <Paper>
        {loading && (
          <Box textAlign="center" p={4}>
            <CircularProgress />
            <Typography mt={1}>Loading data...</Typography>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <TableContainer>
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
                      <TableCell>{row.scanned_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Stack
              direction="row"
              justifyContent="space-between"
              p={2}
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

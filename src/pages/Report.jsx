import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
];

export default function Report() {
  const { token } = useAuth();

  const [filter, setFilter] = useState("today");
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // FETCH DATA (ONLY ONCE)
  // ==========================
  useEffect(() => {
    let active = true;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://192.168.1.53:5000/api/history/all-scans`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch report");
        }

        const normalized = (result.users || result || []).map((r, i) => ({
          id: r.id || i,
          full_name: r.full_name || "Unknown",
          id_number: r.id_number || "N/A",
          scanned_at: r.verified_at || null, // ✅ IMPORTANT
        }));

        if (active) {
          setRawData(normalized);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReport();
    return () => (active = false);
  }, [token]);

  // ==========================
  // FILTER LOGIC (USES verified_at)
  // ==========================
  useEffect(() => {
    const now = new Date();

    const filtered = rawData.filter((item) => {
      if (!item.scanned_at) return false; // skip unverified

      const scanDate = new Date(item.scanned_at);

      if (filter === "today") {
        return scanDate.toDateString() === now.toDateString();
      }

      if (filter === "7days") {
        const past = new Date();
        past.setDate(now.getDate() - 7);
        return scanDate >= past && scanDate <= now;
      }

      if (filter === "30days") {
        const past = new Date();
        past.setDate(now.getDate() - 30);
        return scanDate >= past && scanDate <= now;
      }

      return true;
    });

    setData(filtered);
  }, [filter, rawData]);

  // ==========================
  // EXPORT TO EXCEL
  // ==========================
  const exportToExcel = () => {
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((d) => ({
        Full_Name: d.full_name,
        ID_Number: d.id_number,
        Verified_At: d.scanned_at
          ? new Date(d.scanned_at).toLocaleString()
          : "Not Verified",
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `report-${filter}.xlsx`);
  };

  // ==========================
  // UI
  // ==========================
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Reports
      </Typography>

      {/* FILTERS */}
      <Stack direction="row" spacing={2} mb={3}>
        {FILTERS.map((f) => (
          <Button
            // key={f.value}
            variant={filter === f.value ? "contained" : "outlined"}
            onClick={() => setFilter(f.value)}
            sx={{
              color: filter === f.value ? "white" : "black",
              backgroundColor: filter === f.value ? "black" : "transparent",
              borderColor: "black",
              "&:hover": {
                backgroundColor:
                  filter === f.value ? "#222" : "rgba(0,0,0,0.05)",
                borderColor: "black",
              },
            }}
          >
            {f.label}
          </Button>
        ))}

        <Button
          variant="contained"
          color="success"
          onClick={exportToExcel}
          disabled={!data.length}
        >
          Export Excel
        </Button>
      </Stack>

      <Paper>
        {loading && (
          <Stack direction="row" spacing={1} sx={{ p: 2, mt: 1 }}>
            <CircularProgress size={18} sx={{ color: "black" }} />
            <Typography variant="caption">Loading report...</Typography>
          </Stack>
        )}

        {error && (
          <Alert sx={{ p: 2, mt: 1 }} severity="error">
            {error}
          </Alert>
        )}

        {!loading && data.length === 0 && (
          <Box textAlign="center" sx={{ p: 2, mt: 1 }}>
            <Typography color="text.secondary">No records found</Typography>
          </Box>
        )}

        {data.length > 0 && (
          <TableContainer sx={{ mt: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Full Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Employee ID</b>
                  </TableCell>
                  <TableCell>
                    <b>Verified At</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.full_name}</TableCell>
                    <TableCell>{row.id_number}</TableCell>
                    <TableCell>
                      {row.scanned_at
                        ? new Date(row.scanned_at).toLocaleString()
                        : "Not Verified"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

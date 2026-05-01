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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // FETCH DATA
  // ==========================
  useEffect(() => {
    let active = true;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://192.168.1.56:5000/api/reports?range=${filter}`,
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

        const normalized = (result.data || result || []).map((r, i) => ({
          id: r.id || i,
          full_name: r.full_name || r.name || "Unknown",
          id_number: r.id_number || "N/A",
          scanned_at: r.scanned_at || r.created_at || "-",
        }));

        if (active) setData(normalized);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReport();
    return () => (active = false);
  }, [filter, token]);

  // ==========================
  // EXPORT TO EXCEL
  // ==========================
  const exportToExcel = () => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
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
      <Typography variant="h4" sx={{ mb: 1 }} fontWeight={700} mb={3}>
        Reports
      </Typography>

      {/* FILTERS */}
      <Stack direction="row" spacing={2} mb={3} sx={{ mb: 1 }}>
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "contained" : "outlined"}
            onClick={() => setFilter(f.value)}
            sx={{
              // TEXT
              color: filter === f.value ? "white" : "black",

              // BACKGROUND
              backgroundColor: filter === f.value ? "black" : "transparent",

              // BORDER (for outlined)
              borderColor: "black",

              // HOVER
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
          <Stack direction="row" spacing={1} sx={{ padding: 2 }}>
            <CircularProgress size={18} sx={{ color: "black" }} />
            <Typography variant="caption">Loading report...</Typography>
          </Stack>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && data.length === 0 && (
          <Box p={4} textAlign="center" sx={{ padding: 1 }}>
            <Typography color="text.secondary">No records found</Typography>
          </Box>
        )}

        {data.length > 0 && (
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
                {data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.full_name}</TableCell>
                    <TableCell>{row.id_number}</TableCell>
                    <TableCell>{row.scanned_at}</TableCell>
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

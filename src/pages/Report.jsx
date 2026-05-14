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
  TextField,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Report() {
  const { token } = useAuth();

  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
          scanned_at: r.verified_at || null,
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

    return () => {
      active = false;
    };
  }, [token]);

  //#################################

  // FILTER LOGIC

  useEffect(() => {
    let filtered = [...rawData];

    filtered = filtered.filter((item) => {
      if (!item.scanned_at) return false;

      const scanDate = new Date(item.scanned_at);

      // START DATE
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        if (scanDate < start) return false;
      }

      // END DATE
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (scanDate > end) return false;
      }

      return true;
    });

    setData(filtered);
  }, [startDate, endDate, rawData]);

  // ==========================
  // CLEAR FILTERS

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

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

    saveAs(file, `report.xlsx`);
  };

  // ==========================
  // UI
  // ==========================
  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
          letterSpacing: 0.6,
          color: "#004d40",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Reports
      </Typography>

      {/* FILTERS */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        alignItems={{ sm: "center" }}
      >
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            minWidth: 200,
            // 1. Hide the placeholder text when not focused and empty
            "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
              {
                color: startDate ? "inherit" : "transparent",
              },
            // 2. Show the placeholder text when focused
            "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
              {
                color: "inherit",
              },
          }}
        />

        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            minWidth: 200,
            // 1. Hide the placeholder text when not focused and empty
            "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
              {
                color: endDate ? "inherit" : "transparent",
              },
            // 2. Show the placeholder text when focused
            "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
              {
                color: "inherit",
              },
          }}
        />

        <Button
          variant="outlined"
          onClick={clearFilters}
          sx={{
            color: "black",
            borderColor: "black",
            height: 56,
            "&:hover": {
              borderColor: "black",
              backgroundColor: "rgba(0,0,0,0.05)",
            },
          }}
        >
          Clear Filters
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={exportToExcel}
          disabled={!data.length}
          sx={{
            height: 56,
          }}
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

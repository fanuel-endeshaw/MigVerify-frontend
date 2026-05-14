import {
  Alert,
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
  TextField,
  Pagination,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const apiBaseUrl = "http://192.168.1.53:5000";

const outfitFont = {
  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
};

export default function Report() {
  const { token } = useAuth();

  const [data, setData] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // FETCH REPORT
  // ==========================
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "";

      // ==========================
      // FILTERED API
      // ==========================
      if (startDate) {
        endpoint = `${apiBaseUrl}/api/history/scans-by-date-range?startDate=${startDate}`;

        if (endDate) {
          endpoint += `&endDate=${endDate}`;
        }
      } else {
        // prevent only endDate
        if (endDate) {
          alert("Start date is required.");
          setEndDate("");
          return;
        }

        // ==========================
        // NORMAL PAGINATION API
        // ==========================
        endpoint = `${apiBaseUrl}/api/history/all-scans/${page}`;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch report");
      }

      const normalized = (result.users || []).map((r, i) => ({
        id: r.id || i,
        full_name: r.user_name || r.full_name || "Unknown",
        id_number: r.id_number || "N/A",
        scanned_at: r.verified_at || null,
        phone_number: r.phone_number || "",
      }));

      setData(normalized);

      // pagination pages
      setPages(result.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // FETCH ON CHANGE
  // ==========================
  useEffect(() => {
    fetchReport();
  }, [page, startDate, endDate]);

  // ==========================
  // CLEAR FILTERS
  // ==========================
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // ==========================
  // EXPORT EXCEL
  // ==========================
  const exportToExcel = () => {
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((d) => ({
        Full_Name: d.full_name,
        Employee_ID: d.id_number,
        Phone_Number: d.phone_number,
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

    saveAs(file, "report.xlsx");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
          letterSpacing: 0.6,
          color: "#004d40",
          fontWeight: 700,
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
        {/* START DATE */}
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(1);
            setStartDate(e.target.value);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            minWidth: 200,

            "& input": {
              ...outfitFont,
            },

            "& label": {
              ...outfitFont,
            },

            "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
              {
                color: startDate ? "inherit" : "transparent",
              },

            "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
              {
                color: "inherit",
              },
          }}
        />

        {/* END DATE */}
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setPage(1);
            setEndDate(e.target.value);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            minWidth: 200,

            "& input": {
              ...outfitFont,
            },

            "& label": {
              ...outfitFont,
            },

            "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
              {
                color: endDate ? "inherit" : "transparent",
              },

            "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
              {
                color: "inherit",
              },
          }}
        />

        {/* CLEAR */}
        <Button
          variant="outlined"
          onClick={clearFilters}
          sx={{
            color: "black",
            borderColor: "black",
            height: 56,
            textTransform: "none",
            fontWeight: 600,
            ...outfitFont,

            "&:hover": {
              borderColor: "black",
              backgroundColor: "rgba(0,0,0,0.05)",
            },
          }}
        >
          Clear Filters
        </Button>

        {/* EXPORT */}
        <Button
          variant="contained"
          color="success"
          onClick={exportToExcel}
          disabled={!data.length}
          sx={{
            height: 56,
            textTransform: "none",
            fontWeight: 600,
            ...outfitFont,
          }}
        >
          Export Excel
        </Button>
      </Stack>

      <Paper>
        {/* LOADING */}
        {loading && (
          <Stack direction="row" spacing={1} sx={{ p: 2, mt: 1 }}>
            <CircularProgress size={18} sx={{ color: "black" }} />

            <Typography variant="caption" sx={outfitFont}>
              Loading report...
            </Typography>
          </Stack>
        )}

        {/* ERROR */}
        {error && (
          <Alert sx={{ p: 2, mt: 1 }} severity="error">
            {error}
          </Alert>
        )}

        {/* EMPTY */}
        {!loading && data.length === 0 && (
          <Box textAlign="center" sx={{ p: 2, mt: 1 }}>
            <Typography color="text.secondary" sx={outfitFont}>
              No records found
            </Typography>
          </Box>
        )}

        {/* TABLE */}
        {data.length > 0 && (
          <>
            <TableContainer sx={{ mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Full Name
                    </TableCell>

                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Employee ID
                    </TableCell>

                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Phone Number
                    </TableCell>

                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Verified At
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={outfitFont}>{row.full_name}</TableCell>

                      <TableCell sx={outfitFont}>{row.id_number}</TableCell>

                      <TableCell sx={outfitFont}>{row.phone_number}</TableCell>

                      <TableCell sx={outfitFont}>
                        {row.scanned_at
                          ? new Date(row.scanned_at).toLocaleString()
                          : "Not Verified"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            {!startDate && (
              <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
                <Pagination
                  count={pages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

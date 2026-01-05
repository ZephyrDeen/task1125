"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
  company: string;
  role: string;
  status: string;
}

interface UserEditModalProps {
  open: boolean;
  user: UserData | null;
  onClose: () => void;
  onSave: (user: UserData) => void;
}

const statusOptions = ["Active", "Pending", "Banned", "Rejected"];
const countryOptions = [
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "UK", name: "UK", flag: "🇬🇧" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
];

export default function UserEditModal({ open, user, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = React.useState<UserData | null>(null);

  React.useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  if (!formData) return null;

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const getStatusMessage = () => {
    switch (formData.status) {
      case "Pending":
        return "Account is waiting for confirmation";
      case "Banned":
        return "Account has been banned";
      case "Rejected":
        return "Account has been rejected";
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 20, color: "#212B36", pb: 2 }}>
        Quick update
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {statusMessage && (
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                bgcolor: "rgba(0,184,217,0.08)",
                color: "#006C9C",
                "& .MuiAlert-icon": { color: "#00B8D9" },
                borderRadius: 2,
              }}
            >
              {statusMessage}
            </Alert>
          )}

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => handleChange("status", e.target.value)}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Name & Email */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <TextField
              fullWidth
              label="Email address"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </Stack>

          {/* Phone & Country */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Phone number"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={(e) => handleChange("country", e.target.value)}
              >
                {countryOptions.map((country) => (
                  <MenuItem key={country.code} value={country.name}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* State & City */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="State/region"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </Stack>

          {/* Address & Zip */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            <TextField
              fullWidth
              label="Zip/code"
              value={formData.zip_code}
              onChange={(e) => handleChange("zip_code", e.target.value)}
            />
          </Stack>

          {/* Company & Role */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Company"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
            />
            <TextField
              fullWidth
              label="Role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
            />
          </Stack>

          {/* Buttons */}
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: "#212B36",
                borderColor: "rgba(145,158,171,0.32)",
                "&:hover": { borderColor: "#212B36", bgcolor: "transparent" },
                borderRadius: 2,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: "#212B36",
                "&:hover": { bgcolor: "#454F5B" },
                borderRadius: 2,
                px: 3,
              }}
            >
              Update
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}


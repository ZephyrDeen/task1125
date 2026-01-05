"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { UserRecord } from "./types";

interface UserDetailsModalProps {
  user: UserRecord | null;
  open: boolean;
  onClose: () => void;
}

const infoFields = (user: UserRecord) => [
  { label: "Email", value: user.email },
  { label: "Phone", value: user.phone_number },
  { label: "Company", value: user.company },
  { label: "Role", value: user.role },
  { label: "Status", value: user.status },
];

export default function UserDetailsModal({ user, open, onClose }: UserDetailsModalProps) {
  const avatarSrc = user ? `https://i.pravatar.cc/150?u=${user.id}` : undefined;

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={onClose}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">{user ? user.name : "Loading user"}</Typography>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent dividers>
        {user ? (
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={avatarSrc} sx={{ width: 64, height: 64, fontSize: 32 }}>
                {user.name[0]}
              </Avatar>
              <Stack spacing={0.2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.company}
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={1}>
              {infoFields(user).map((field) => (
                <Box key={field.label}>
                  <Typography variant="caption" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography>{field.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Typography>Loading user details…</Typography>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box flexGrow={1} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}


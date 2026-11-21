import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface CancelBookingDialogProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelBookingDialog = ({ open, isLoading, onClose, onConfirm }: CancelBookingDialogProps) => (
  <Dialog
    open={open}
    onClose={isLoading ? undefined : onClose}
    aria-labelledby="cancel-booking-title"
    aria-describedby="cancel-booking-desc"
  >
    <DialogTitle id="cancel-booking-title" sx={{ fontFamily: "var(--font-serif)" }}>
      取消預約
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="cancel-booking-desc">確定要取消這筆預約？取消後無法復原。</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={isLoading} sx={{ color: "var(--text-secondary)" }}>
        算了
      </Button>
      <Button onClick={onConfirm} disabled={isLoading} variant="contained" disableElevation
        sx={{ background: "oklch(0.42 0.14 15)", "&:hover": { background: "oklch(0.36 0.14 15)" } }}>
        {isLoading ? "取消中…" : "確認取消"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default CancelBookingDialog;

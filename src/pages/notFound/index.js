import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const NotFound = () => (
  <Box
    sx={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      px: 2,
      textAlign: "center",
      boxSizing: "border-box",
      maxWidth: "100%",
    }}
  >
    <Typography
      component="h1"
      sx={{ fontSize: { xs: 64, sm: 96 }, fontWeight: 700, lineHeight: 1, color: "var(--accent)" }}
    >
      404
    </Typography>
    <Typography sx={{ fontSize: { xs: 16, sm: 18 }, wordBreak: "break-word" }}>
      找不到這個頁面，網址可能有誤或頁面已被移除。
    </Typography>
    <Button component={Link} to="/" variant="contained" sx={{ mt: 1 }}>
      回首頁
    </Button>
  </Box>
);

export default NotFound;

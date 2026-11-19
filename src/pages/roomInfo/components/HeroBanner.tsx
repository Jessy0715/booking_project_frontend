import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/image/mainRoom.jpg";

export const ROOM_LIST_ANCHOR_ID = "room-list";

const HeroBanner = () => {
  const navigate = useNavigate();

  const handleBrowseRooms = () => {
    document.getElementById(ROOM_LIST_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      component="section"
      aria-label="Lumino 自然光攝影棚簡介"
      sx={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        minHeight: { xs: 340, md: 420 },
        backgroundColor: "var(--text)",
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.62), rgba(0,0,0,0.15) 75%), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box sx={{ position: "relative", px: { xs: 3, md: 8 }, py: 5, color: "white", maxWidth: 560 }}>
        <Typography
          component="div"
          sx={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.75, mb: 1.5 }}
        >
          Photography Studio · Booking
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: { xs: 28, md: 40 },
            fontWeight: 400,
            letterSpacing: "0.06em",
            lineHeight: 1.3,
            mb: 1.5,
          }}
        >
          Lumino 自然光攝影棚
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8, opacity: 0.85, mb: 3 }}>
          尋找完美的拍攝空間，捕捉每個動人瞬間。
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/roomReserve")}
            sx={{
              minHeight: 44,
              px: 3,
              background: "var(--accent)",
              borderRadius: "var(--r)",
              boxShadow: "var(--shadow-sm)",
              "&:hover": { background: "var(--accent-hover)" },
            }}
          >
            立即預約
          </Button>
          <Button
            variant="outlined"
            onClick={handleBrowseRooms}
            sx={{
              minHeight: 44,
              px: 3,
              color: "white",
              borderColor: "rgba(255,255,255,0.7)",
              borderRadius: "var(--r)",
              "&:hover": { borderColor: "white", background: "rgba(255,255,255,0.12)" },
            }}
          >
            瀏覽場地
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroBanner;

// import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Box } from "@mui/material";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../../swipe.css";

const MultiSwiper = ({ roomImg }) => {
  return (
    <>
      <Box sx={{ width: "300px", mr: 3.5 }}>
        <Swiper
          modules={[Pagination]}
          pagination={{
            clickable: true,
            bulletActiveClass: "swiper-bullet-active",
          }}
          autoplay={{ delay: 3000 }}
          spaceBetween={10}
          slidesPerView={1}
        >
          {roomImg.map((imgSrc, index) => (
            <SwiperSlide key={index}>
              <img
                style={{ width: "300px" }}
                src={imgSrc}
                alt={`Image ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </>
  );
};

export default MultiSwiper;

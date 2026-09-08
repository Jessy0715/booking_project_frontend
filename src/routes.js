import Login from "./pages/login";
import Register from "./pages/register";
import Admin from "./pages/admin";
import RoomInfo from "./pages/roomInfo";
import RoomReserve from "./pages/roomReserve";
import RentCalendar from "./components/rentCalendar";
import MyBookings from "./pages/myBookings";
const routes = [
  {
    path: "/",
    element: <RoomInfo />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/roomInfo",
    element: <RoomInfo />,
  },
  {
    path: "/roomReserve",
    element: <RoomReserve />,
  },
  {
    path: "/rentCalendar",
    element: <RentCalendar />,
  },
  {
    path: "/myBookings",
    element: <MyBookings />,
  },
  // {
  //   path: "*",
  //   element: <NotFound />,
  //   children: [],
  // },
];

export default routes;

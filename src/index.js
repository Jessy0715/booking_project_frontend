import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// antd

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// css 重置
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";

import GlobalStyle from "./styles/GlobalStyle";
import "./styles/tokens.css";

const bookingTheme = createTheme({
  palette: {
    primary: {
      main: "#938C8C",
      dark: "#757070",
    },
    secondary: {
      main: "#D9D9D9",
    },
    other: {
      main: "rgba(0,0,0,0.2)",
    },
  },
  typography: {
    subtitle1: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      color: "#938C8C",
    },
    subtitle2: {
      fontSize: "1rem",
    },
    subtitle3: {
      fontSize: "1.2rem",
    },
  },
});
// 如果你想在多个组件中共享样式，可以将 mak
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStyle />
      <ScopedCssBaseline>
        <ThemeProvider theme={bookingTheme}>
          <App />
        </ThemeProvider>
      </ScopedCssBaseline>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

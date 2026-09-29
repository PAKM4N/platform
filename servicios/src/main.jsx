import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import ServiciosApp from "./ServiciosApp.jsx";
import "./servicios.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ServiciosApp />
  </React.StrictMode>,
);

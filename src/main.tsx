import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import MiniDrawer from "./components/header";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MiniDrawer />
    <App />
  </React.StrictMode>,
);

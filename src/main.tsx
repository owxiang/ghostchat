import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import AppLocal from "./AppLocal";
import "./index.css";

const ComponentToRender =
  process.env.NODE_ENV === "development" ? AppLocal : App; // to run locally without backend server
// const ComponentToRender = App; // to run locally with backend server

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ComponentToRender />
);

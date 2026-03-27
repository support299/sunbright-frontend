import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { DateFilterProvider } from "./contexts/DateFilterContext";
import { store } from "./store/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <DateFilterProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DateFilterProvider>
    </Provider>
  </React.StrictMode>
);

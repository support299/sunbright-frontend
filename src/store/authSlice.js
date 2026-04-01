import { createSlice } from "@reduxjs/toolkit";

const USER_STORAGE_KEY = "sunbrightUser";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const initialState = {
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: readStoredUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { access, refresh, user } = action.payload;
      state.accessToken = access;
      state.refreshToken = refresh;
      const nextUser = user !== undefined ? user : state.user;
      state.user = nextUser ?? null;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      if (nextUser != null) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem(USER_STORAGE_KEY);
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

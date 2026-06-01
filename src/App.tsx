import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AllTodos from "./pages/AllTodos";
import Home from "./pages/Home";
import ListDetail from "./pages/ListDetail";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas internas protegidas: comparten el Layout con sidebar. */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/list/:id" element={<ListDetail />} />
        <Route path="/todos" element={<AllTodos />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

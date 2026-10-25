import { Routes, Route } from "react-router-dom";
import { publicRoutes, protectedRoutes } from "./routeConfig";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {protectedRoutes.map(({ path, element, roles }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute roles={roles}>
              {element}
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
}

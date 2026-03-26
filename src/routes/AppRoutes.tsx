import { useRoutes } from "react-router-dom";
import { userRoutes } from "./userRoutes";

export const AppRoutes = () => {
  const routes = useRoutes([userRoutes]);
  return routes;
};

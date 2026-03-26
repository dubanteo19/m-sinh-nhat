import { HomePage } from "@/page/HomePage";
import { type RouteObject } from "react-router-dom";

export const userRoutes: RouteObject = {
  path: "/",
  children: [
    { index: true, element: <HomePage /> },
  ],
};

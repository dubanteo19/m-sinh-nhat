import { HomePage } from "@/page/HomePage";
import { InfoPage } from "@/page/InfoPage";
import { type RouteObject } from "react-router-dom";

export const userRoutes: RouteObject = {
  path: "/",
  children: [
    { index: true, element: <HomePage /> },
    { path: "info/:id", element: <InfoPage /> },
  ],
};

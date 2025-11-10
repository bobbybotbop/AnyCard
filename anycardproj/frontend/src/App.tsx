import { MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/Error";
import RootLayout from "./layouts/RootLayout";
import { PATHS } from "./constants/Navigation";
import "./index.css";

const theme = {
  fontFamily:
    '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      ...PATHS.map((item) => ({
        path: item.link,
        element: item.element,
      })),
    ],
  },
]);

export default function App() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

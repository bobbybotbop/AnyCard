import { MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/Error";
import TradingOther from "./pages/TradingOther";
import RootLayout from "./layouts/RootLayout";
import { PATHS } from "./constants/Navigation";
import { AuthUserProvider } from "./auth/authProvider";
import "./index.css";
import Trading from "./pages/Trading";

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
      ...PATHS.map((item) => {
        const Component = item.component;
        return {
          path: item.link,
          element: <Component />,
        };
      }),
      {
        path: "/trading/:uid",
        element: <TradingOther />,
      },
    ],
  },
]);

export default function App() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AuthUserProvider>
        <RouterProvider router={router} />
      </AuthUserProvider>
    </MantineProvider>
  );
}

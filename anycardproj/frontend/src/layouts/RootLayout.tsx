import { HeaderSimple } from "../components/Header";
import { PATHS } from "../constants/Navigation";
import { Outlet, useLocation } from "react-router-dom";

const RootLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* change to 0, -1 to hide login in nav and disables nav bar in login page */}
      {!isLoginPage && <HeaderSimple links={PATHS.slice(0, -1)} />}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;

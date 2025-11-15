import { HeaderSimple } from "../components/Header";
import { PATHS } from "../constants/Navigation";
import { Outlet } from "react-router-dom";

const RootLayout = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      width: "100%",
    }}
  >
    {/* change to 0, -1 to hide login in nav */}
    <HeaderSimple links={PATHS.slice(0, PATHS.length)} />
    <div style={{ flex: 1 }}>
      <Outlet />
    </div>
  </div>
);

export default RootLayout;

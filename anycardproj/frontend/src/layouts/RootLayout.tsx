import { HeaderSimple } from "../components/Header";
import { PATHS } from "../constants/Navigation";
import { Outlet, useLocation } from "react-router-dom";

const RootLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* change to 0, -1 to hide login in nav and disables nav bar in login page */}
      {!isLoginPage && <HeaderSimple links={PATHS.slice(0, -1)} />}
      <main
        className="flex-1 transition-all duration-300"
        style={{
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;

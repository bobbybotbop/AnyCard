import Inventory from "../pages/Inventory";
import Profile from "../pages/Profile";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import Trading from "../pages/Trading";
import { ComponentType } from "react";
import {
  LucideIcon,
  Home,
  User,
  Package,
  LogIn,
  ArrowLeftRight,
} from "lucide-react";

/**
 * TODO: Modify this constant to point to the URL of your backend.
 * It should be of the format "https://<app-name>.fly.dev/api"
 *
 * Most of the time, the name of your app is the name of the folder you're in
 * right now, and the name of your Git repository.
 * For instance, if that name is "my-app", then you should set this to:
 * "https://my-app.fly.dev/api"
 *
 * If you've already deployed your app (using `fly launch` or `fly deploy`),
 * you can find the name by running `flyctl status`, under App > Name.
 */
// For local development, use localhost. For production, use the deployed URL
export const BACKEND_BASE_PATH = "http://localhost:8080";
// export const BACKEND_BASE_PATH = "https://fa23-lec9-demo-soln.fly.dev/api";

export const PATHS: {
  link: string;
  label: string;
  component: ComponentType;
  icon: LucideIcon;
}[] = [
  {
    link: "/",
    label: "Home",
    component: HomePage,
    icon: Home,
  },
  {
    link: "/profile",
    label: "Profile",
    component: Profile,
    icon: User,
  },
  {
    link: "/inventory",
    label: "Inventory",
    component: Inventory,
    icon: Package,
  },
  {
    link: "/trading",
    label: "Trading",
    component: Trading,
    icon: ArrowLeftRight,
  },
  {
    link: "/login",
    label: "login",
    component: LoginPage,
    icon: LogIn,
  },
];

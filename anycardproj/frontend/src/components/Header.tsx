import { Link } from "react-router-dom";
import { Home, User, Package, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import anyCardLogo from "../../public/anyCardLogo.png";

interface HeaderSimpleProps {
  links: {
    link: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 pt-[2vh] transition-all duration-300 ${
        isScrolled ? "backdrop-blur-xs" : "bg-transparent"
      }`}
    >
      <div className="pb-[2vh] flex border-b-1 border-white/50">
        {/* Left Navigation Icons */}
        <div className="flex items-center w-[40vw] justify-end gap-16 pr-16">
          <Link to="/" className="text-white" title="Home">
            <Home className="w-6 h-6 flex-shrink-0" />
          </Link>
          <Link to="/profile" className="text-white" title="Profile">
            <User className="w-6 h-6 flex-shrink-0" />
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="w-[20vw] flex items-center justify-center">
          <img
            src={anyCardLogo}
            alt="AnyCard Logo"
            className="invert h-[8vh] w-auto saturate-[10]"
          />
        </div>

        {/* Right Navigation Icons + Logo */}
        <div className="flex w-[40vw] items-center gap-16 pl-16">
          <Link to="/inventory" className="text-white" title="Inventory">
            <Package className="w-6 h-6 flex-shrink-0" />
          </Link>
          <Link to="/trading" className="text-white" title="Trading">
            <ArrowLeftRight className="w-6 h-6 flex-shrink-0" />
          </Link>
          {/* <img className="h-10 w-auto ml-2" src={logo} alt="AnyCard Logo" /> */}
        </div>
      </div>
    </header>
  );
}

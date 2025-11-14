import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderSimpleProps {
  links: { link: string; label: string }[];
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={`leading-none py-2 px-3 rounded text-sm font-medium no-underline transition-colors ${
        active === link.link
          ? "bg-blue-100 text-blue-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className="h-[60px] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-8">
        <nav className="flex-row items-center gap-1">{items}</nav>
      </div>
    </header>
  );
}

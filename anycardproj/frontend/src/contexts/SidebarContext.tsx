import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  opened: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(true);

  const toggle = () => {
    setOpened((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ opened, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}



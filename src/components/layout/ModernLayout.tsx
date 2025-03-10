
import { ReactNode } from "react";
import ModernHeader from "./ModernHeader";

interface ModernLayoutProps {
  children: ReactNode;
}

const ModernLayout = ({ children }: ModernLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F13] text-white">
      <ModernHeader />
      {/* Add padding-top to account for fixed header */}
      <main className="flex-grow pt-16">{children}</main>
    </div>
  );
};

export default ModernLayout;

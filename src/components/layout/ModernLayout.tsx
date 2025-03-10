
import { ReactNode } from "react";
import ModernHeader from "./ModernHeader";
import P5Background from "@/components/ui/P5Background";

interface ModernLayoutProps {
  children: ReactNode;
}

const ModernLayout = ({ children }: ModernLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F13] text-white relative overflow-hidden">
      {/* P5.js animated background */}
      <P5Background className="opacity-40" />
      
      <ModernHeader />
      {/* Add padding-top to account for fixed header */}
      <main className="flex-grow pt-16 relative z-10">{children}</main>
    </div>
  );
};

export default ModernLayout;

import Sidebar from "@/components/Sidebar";

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentStep="about-you" />
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}

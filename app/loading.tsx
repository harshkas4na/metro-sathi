import { TrainFront } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-[#0066CC]">
          <TrainFront size={32} className="text-white" />
        </div>
        <p className="text-sm font-medium text-[#666666]">Loading...</p>
      </div>
    </div>
  );
}

import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Image
            src="/logo/half-logo.png"
            alt="Metro Sathi"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
        </div>
        <p className="text-sm font-medium text-[#666666]">Loading...</p>
      </div>
    </div>
  );
}

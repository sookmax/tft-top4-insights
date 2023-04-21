"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientRedirect({
  redirectPath,
}: {
  redirectPath: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectPath);
  }, [router, redirectPath]);

  return (
    <div className="animate-pulse fixed inset-0 flex justify-center items-center text-4xl">
      {"Redirecting...".toUpperCase()}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      "/panels/shop/services/authentication/schedule/biometric"
    );
  }, [router]);

  return null;
}

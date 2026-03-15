"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";

type UserNavProps = {
  name?: string | null;
  image?: string | null;
};

export function UserNav({ name, image }: UserNavProps) {
  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100">
        <Avatar src={image} name={name} size="sm" />
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

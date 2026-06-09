"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ButtonLink } from "@/components/button";

// Auth-aware nav buttons, isolated into a client component so the marketing
// homepage can be statically prerendered (served from the CDN, no server
// cold start). The signed-in/out state resolves on the client after hydration.
export function HomeNavAuth() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-bold text-coal transition hover:bg-[#eef4ff]">
            Log in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 text-sm font-bold text-white shadow-crisp transition hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]">
            Get started free
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <ButtonLink href="/dashboard" variant="ghost" size="sm">
          Dashboard
        </ButtonLink>
        <UserButton />
      </Show>
    </div>
  );
}

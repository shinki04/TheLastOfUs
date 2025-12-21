import type { Avatar } from "@repo/shared/types/user";
import supabaseLoader from "@repo/supabase/image-loader";
import Image from "next/image";
import React from "react";

interface OldAvatarsProps {
  avatars: Avatar[];
}

function OldAvatars({ avatars }: OldAvatarsProps) {
  return (
    <div className="flex sm:flex-row flex-col gap-2">
      {avatars.map((items) => (
        <Image
          loader={supabaseLoader}
          key={items.name}
          src={items.fullPath}
          width={200}
          height={200}
          alt={`Avatar user ${items.name}`}
        />
      ))}
    </div>
  );
}

export default OldAvatars;

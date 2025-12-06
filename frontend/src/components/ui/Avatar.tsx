import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AvatarProps {
  profilePictureUrl?: string | null;
  userName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "w-10 h-10",
    icon: "h-5 w-5",
  },
  md: {
    container: "w-12 h-12",
    icon: "h-6 w-6",
  },
  lg: {
    container: "w-16 h-16",
    icon: "h-8 w-8",
  },
};

export function Avatar({
  profilePictureUrl,
  userName,
  size = "md",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const showImage = profilePictureUrl && !imageError;

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center overflow-hidden",
        sizeClasses[size].container,
        className
      )}
    >
      {showImage ? (
        <img
          src={profilePictureUrl}
          alt={userName || "User avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <User className={cn("text-primary", sizeClasses[size].icon)} />
      )}
    </div>
  );
}

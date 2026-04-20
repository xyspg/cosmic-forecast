import Image from "next/image";
import icon from "@/app/icon.png";

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src={icon}
      alt="Bureau seal"
      width={size}
      height={size}
      priority
      style={{ display: "block", width: size, height: size }}
    />
  );
}

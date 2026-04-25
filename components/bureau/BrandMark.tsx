export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/icon.png"
      alt="Bureau seal"
      width={size}
      height={size}
      className="block"
      style={{ width: size, height: size }}
    />
  );
}

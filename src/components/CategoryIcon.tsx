import { getIcon } from "@/lib/icon-map";

export function CategoryIcon({
  icon,
  color,
  size = 18,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const Icon = getIcon(icon);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size + 16,
        height: size + 16,
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {/* Icon is looked up from a static lookup table, not created dynamically */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon size={size} />
    </span>
  );
}

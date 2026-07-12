/* The shared Village Collective campfire mark — the family symbol that ties
   Village Market to its parent brand. Rendered as the source SVG so it stays
   crisp; the `flicker` class gives it a slow firelight pulse. */
export default function Campfire({
  className = "",
  flicker = false,
}: {
  className?: string;
  flicker?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/campfire-mark.svg"
      alt=""
      aria-hidden="true"
      className={`${flicker ? "flicker" : ""} ${className}`}
    />
  );
}

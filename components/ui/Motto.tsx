/** The studio line, broken only between its phrases so no word is left alone on a line. */
export default function Motto({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(?<=\.)\s+/);
  return (
    <p className={className}>
      {parts.map((p, i) => (
        <span key={p} className="motto__part">
          {p}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

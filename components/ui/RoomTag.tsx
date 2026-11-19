/** Architectural section-callout bubble used to label each "room". */
export default function RoomTag({ no, room, label }: { no: string; room: string; label?: string }) {
  return (
    <p className="roomtag">
      <span className="roomtag__bubble" aria-hidden="true">
        <span>{no}</span>
        <span>A</span>
      </span>
      <span className="roomtag__text">
        <span className="roomtag__room">{room}</span>
        {label && <span className="roomtag__label">{label}</span>}
      </span>
    </p>
  );
}

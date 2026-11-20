import { process } from "@/content/process";
import RoomTag from "@/components/ui/RoomTag";

export default function Process() {
  return (
    <section id="process" className="process" data-tone="light" aria-labelledby="process-h">
      <div className="wrap">
        <RoomTag no="03" room="Our process" label="From first meeting to handover" />
        <h2 id="process-h" className="display">How a project comes together.</h2>
        <ol className="process__list">
          {process.map((s) => (
            <li key={s.n} className="process__step">
              <span className="process__n">{s.n}</span>
              <span className="process__tick" aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

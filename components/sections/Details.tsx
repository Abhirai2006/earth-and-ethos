import Picture from "@/components/Picture";
import RoomTag from "@/components/ui/RoomTag";
import LightboxGroup from "@/components/ui/Lightbox";
import { toLb } from "@/lib/lightbox";

// Close-ups of craft, drawn only from completed, photographed work.
const details = [
  { k: "gurukrupa/20240617-074438", material: "Projecting brick jaali", project: "Gurukrupa", alt: "Close view of a projecting brick jaali casting a grid of shadows" },
  { k: "athreya-mane/filler-slab-design", material: "Filler-slab ceiling", project: "Athreya Mane", alt: "Clay-red filler-slab ceiling seen up through the stair void" },
  { k: "athreya-mane/pooja-room-2", material: "Carved timber", project: "Athreya Mane", alt: "Hand-carved timber double doors of a pooja room" },
  { k: "gurukrupa/20240617-074027", material: "Pergola skylight", project: "Gurukrupa", alt: "Stripes of sunlight from a pergola skylight falling across a brick wall" },
  { k: "athreya-mane/6a86ee29", material: "Jaali at dusk", project: "Athreya Mane", alt: "Perforated brick stair screen glowing from inside at dusk" },
  { k: "gurukrupa/20240617-074218", material: "Terracotta pergola", project: "Gurukrupa", alt: "Terracotta pergola over a roof terrace framing trees" },
  { k: "athreya-mane/staircase", material: "Open-riser stair", project: "Athreya Mane", alt: "Open-riser steel and timber staircase with framed art" },
  { k: "yamoksh-residence/20240915-213326", material: "Arched textured panels", project: "Yamoksh Residence", alt: "Three arched textured wall panels in a living room" },
  { k: "gurukrupa/20240617-074126", material: "Exposed brick", project: "Gurukrupa", alt: "Staircase rising beside an exposed brick wall" },
  { k: "athreya-mane/first-floor-lobby", material: "Lime and clay-red walls", project: "Athreya Mane", alt: "Timber settee beneath traditional paintings on a clay-red wall" },
];

export default function Details() {
  const items = details.map((d) => toLb(d.k, d.alt, `${d.material}, ${d.project}`));
  return (
    <section id="details" className="details" data-tone="light" aria-labelledby="details-h">
      <div className="wrap">
        <div className="details__head">
          <RoomTag no="05" room="Material library" label="Details" />
          <h2 id="details-h" className="display">The details do the talking.</h2>
          <p>
            Brick laid to let air and light through. A filler-slab ceiling. Timber carved by hand. A closer look at
            the materials and craft in our finished work.
          </p>
        </div>
        <LightboxGroup items={items} className="details__grid">
          {details.map((d, i) => (
            <button key={d.k} type="button" className={`swatch swatch--${i}`} data-lb={i} aria-label={`Enlarge: ${d.material}, ${d.project}`}>
              <Picture k={d.k} alt={d.alt} sizes="(min-width: 900px) 30vw, 90vw" />
              <span className="swatch__cap">
                <b>{d.material}</b>
                <span>{d.project}</span>
              </span>
            </button>
          ))}
        </LightboxGroup>
      </div>
    </section>
  );
}

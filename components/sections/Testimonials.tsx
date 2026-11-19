import { testimonials } from "@/content/testimonials";
import RoomTag from "@/components/ui/RoomTag";
import GuestBook from "./GuestBook";

export default function Testimonials() {
  return (
    <section id="guestbook" className="guestbook" data-tone="light" aria-labelledby="guest-h">
      <div className="wrap">
        <RoomTag no="06" room="Guest book" label="Kind words from clients" />
        <h2 id="guest-h" className="display">Notes left in the guest book.</h2>
        <GuestBook items={testimonials} />
      </div>
    </section>
  );
}

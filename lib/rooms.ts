// The page is a house. Each section is a room on the floor plan.
export type Room = { id: string; room: string; label: string; x: number; y: number; w: number; h: number };

export const rooms: Room[] = [
  { id: "top", room: "Entrance", label: "Home", x: 150, y: 250, w: 100, h: 40 },
  { id: "foyer", room: "Foyer", label: "About the studio", x: 120, y: 170, w: 160, h: 80 },
  { id: "founder", room: "Study", label: "The founder", x: 20, y: 170, w: 100, h: 120 },
  { id: "built", room: "Gallery", label: "Completed works", x: 20, y: 20, w: 100, h: 150 },
  { id: "drawing-board", room: "Drawing board", label: "Ongoing works", x: 120, y: 80, w: 160, h: 90 },
  { id: "details", room: "Design library", label: "Details", x: 280, y: 20, w: 100, h: 110 },
  { id: "guestbook", room: "Guest lounge", label: "Kind words", x: 280, y: 130, w: 100, h: 160 },
  { id: "desk", room: "Front desk", label: "Contact", x: 120, y: 20, w: 160, h: 60 },
];

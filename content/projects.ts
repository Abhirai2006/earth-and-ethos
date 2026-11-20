// Project data. Add a project = add an object here + run `npm run images`.
// Facts come only from the client's Drive folder (folder names, files, the
// Banavara drawing sheet) and what is visible in the images. Where something
// is unknown (year, area, full scope) it is simply left out — never guessed.

export type Img = { k: string; alt: string; render?: boolean };

export type Project = {
  slug: string;
  title: string;
  location: string;
  status: "completed" | "ongoing";
  typology: string;
  scope?: string;
  client?: string;
  summary: string;
  description: string[];
  features: string[];
  cover: Img;
  gallery: Img[];
  /** true when the imagery is design visualisation (renders), not photography */
  renders?: boolean;
  /** drawing sheets: plans, elevations, presentation boards */
  drawings?: Img[];
};

const A = "athreya-mane/";
const G = "gurukrupa/";
const Y = "yamoksh-residence/";
const D = "dasa-rangamandira/";
const B = "banavara-vedike/";
const M = "me-riise-foundation/";
const V = "veena-mahesh-home/";
const N = "dinesh-home/";
const J = "jakkur-office/";

export const projects: Project[] = [
  {
    slug: "athreya-mane",
    title: "Athreya Mane",
    location: "Padmanabhanagar, Bengaluru",
    status: "completed",
    typology: "Residence",
    summary:
      "A spacious 5 BHK home across three floors, where natural light and ventilation shape the architecture, built with Porotherm blocks, Kota stone and filler slabs.",
    // description: the client's own text (Nov 2026)
    description: [
      "A spacious 5 BHK residence thoughtfully organised across the ground and two upper floors, where natural light and ventilation are integral to the architectural expression. The design brings together traditional sensibilities and contemporary aesthetics, creating spaces that are both rooted and progressive.",
      "Porotherm blocks are incorporated as an efficient walling solution, while Kota stone flooring introduces a natural, durable finish. The use of filler slab construction further explores material-conscious building techniques, reducing concrete consumption while adding a distinctive character to the ceilings. Together, these choices reflect an approach to architecture that values resource efficiency, material honesty, thermal comfort and timeless living.",
    ],
    features: ["Porotherm block walls", "Kota stone flooring", "Filler-slab ceilings", "Brick jaali stair screen", "Carved timber pooja doorway"],
    cover: { k: A + "8a413548", alt: "Athreya Mane at dusk: white plastered volumes with a tall perforated brick screen, lit from within" },
    gallery: [
      { k: A + "6a86ee29", alt: "Street corner view of Athreya Mane at dusk, showing the brick jaali screen and warm interior light" },
      { k: A + "9b65bca6", alt: "Athreya Mane in daylight: stacked white balconies beside the perforated brick stair tower" },
      { k: A + "c940222a", alt: "Front elevation with the brick jaali panel, clay-red wall inserts and white window frames" },
      { k: A + "c89b3366", alt: "Entrance wall and gate at night with the house name plate and a young tree" },
      { k: A + "living-area", alt: "Living area with a clay-red ceiling, timber sofa, patterned rug and view through to the pooja doorway" },
      { k: A + "pooja-room", alt: "Pooja room behind an intricately carved timber doorway" },
      { k: A + "pooja-room-2", alt: "Carved timber double doors of the pooja room, closed" },
      { k: A + "filler-slab-design", alt: "Looking up the stair void to the clay-red filler-slab ceiling and skylight" },
      { k: A + "first-floor-lobby", alt: "First-floor lobby with a timber settee beneath framed traditional paintings on a clay-red wall" },
      { k: A + "first-floor-lobby-2", alt: "First-floor lobby: a long built-in seat beside the open-riser staircase and clay-red ceiling" },
      { k: A + "second-floor-lobby", alt: "Second-floor lobby overlooking the stair void, with circular skylights in the ceiling" },
      { k: A + "second-floor-lobby-2", alt: "Second-floor lobby railing and clay-red ceiling bands" },
      { k: A + "staircase", alt: "Open-riser steel and timber staircase with framed art climbing the wall" },
      { k: A + "master-bedroom-1", alt: "Master bedroom with a clay-red accent wall and timber wardrobes" },
      { k: A + "master-bedroom-nook", alt: "Window nook in the master bedroom with a built-in seat and potted plant" },
      { k: A + "m-bed-entrance-view", alt: "View from the master bedroom entrance across grey floors to curtained windows" },
      { k: A + "parents-bedroom", alt: "Parents' bedroom with a four-poster bed and textured timber wall" },
    ],
  },
  {
    slug: "gurukrupa",
    title: "Gurukrupa",
    location: "Hosakerehalli, Bengaluru",
    status: "completed",
    typology: "Residence",
    summary:
      "A three-level 3 BHK home in exposed brick masonry and compressed stabilised earth blocks, built for texture, thermal comfort and material honesty.",
    // description: the client's own text (Nov 2026)
    description: [
      "A three-level 3 BHK residence conceived around a simple rectilinear plan, with a multipurpose hall at the ground level and private residential spaces distributed across the first and second floors.",
      "The design explores a thoughtful approach to materiality and construction, integrating exposed brick masonry and Compressed Stabilised Earth Blocks (CSEB) to bring texture, thermal performance and material honesty into the architecture. By embracing locally relevant building materials and resource-conscious construction techniques, the residence seeks to balance contemporary living with environmental sensitivity, creating spaces that are functional, enduring and rooted in sustainable design principles.",
    ],
    features: ["Exposed brick masonry", "Compressed Stabilised Earth Block (CSEB) walls", "Projecting brick jaali", "Pergola skylight", "Terracotta-tiled roof terraces"],
    cover: { k: G + "20240617-074027", alt: "Double-height hall at Gurukrupa, the pergola skylight casting stripes of sun across an earth-block wall" },
    gallery: [
      { k: G + "20240617-060330", alt: "Street elevation of Gurukrupa: an exposed brick tower beside white balconies" },
      { k: G + "20240617-074433", alt: "Projecting brick jaali, its staggered bricks catching the afternoon sun" },
      { k: G + "20240617-073924", alt: "Hall with an earth-block feature wall, tall timber-framed doors and sunlight on the floor" },
      { k: G + "20240617-074337", alt: "Exposed earth-block wall with a timber shelf and white balustrade at the upper landing" },
      { k: G + "20240617-074126", alt: "Staircase rising along an exposed compressed earth block wall with white steel balusters" },
      { k: G + "20240617-074138", alt: "Looking down through the stair void from the top floor" },
      { k: G + "20240617-074438", alt: "Close view of the brick jaali: projecting bricks throwing a grid of shadows" },
      { k: G + "20240617-074218", alt: "Terracotta pergola over the roof terrace, framing treetops beyond" },
      { k: G + "20240617-074240", alt: "Roof terrace with terracotta tiles and a steel railing overlooking the neighbourhood" },
      { k: G + "20240617-074008", alt: "Bedroom with timber wardrobes and a study desk by the window" },
      { k: G + "20240618-074946", alt: "Kitchen and dining area with a timber table and patterned backsplash" },
    ],
  },
  {
    slug: "brigade-cornerstone-utopia",
    title: "Brigade Cornerstone Utopia",
    location: "Bengaluru",
    status: "completed",
    typology: "Apartment interiors",
    scope: "Interior design",
    summary:
      "A contemporary 2 BHK interior with bold finishes, curated colour and texture, and expressive detailing.",
    // description: the client's own text (Nov 2026)
    description: [
      "A contemporary 2 BHK interior designed to create a vibrant and visually engaging living environment. The design explores bold aesthetics, rich finishes and expressive detailing, bringing together carefully curated colours, textures, lighting and furnishings.",
      "Each space is thoughtfully composed to balance functionality with visual appeal, resulting in interiors that feel stylish, lively and tailored to modern urban living.",
    ],
    features: ["2 BHK apartment interior", "Cove and accent lighting", "Arched textured wall panels", "Modular kitchen and wardrobes"],
    cover: { k: Y + "20240915-213357", alt: "Living room at Brigade Cornerstone Utopia with arched textured panels, cove-lit ceiling and tan sofas" },
    gallery: [
      { k: Y + "20240915-213326", alt: "Living room with three arched, textured wall panels and floating display shelves" },
      { k: Y + "20240915-213348", alt: "Backlit timber television wall with a floating white console" },
      { k: Y + "20240915-213340", alt: "Corridor with an arched mirror and gallery wall leading to a bedroom" },
      { k: Y + "20240915-212652", alt: "Open kitchen beside a pooja unit with a carved jaali screen" },
      { k: Y + "20240915-212627", alt: "Modular kitchen in white and grey with under-cabinet lighting" },
      { k: Y + "20240915-212620", alt: "Entrance console with a brass bowl on black stone against a backlit panel" },
      { k: Y + "20240915-212445", alt: "Vanity with a round backlit mirror and textured wall" },
      { k: Y + "20240915-212425", alt: "Bedroom with a cove-lit ceiling and a timber headboard wall" },
      { k: Y + "20240915-212551", alt: "Bedroom with a textured feature wall, timber floor and cove lighting" },
      { k: Y + "20240915-212434", alt: "Study corner with floating shelves and a slim desk" },
    ],
  },
  {
    slug: "dasa-rangamandira",
    title: "D.A.S.A Rangamandira",
    location: "Dharwad, Karnataka",
    status: "ongoing",
    typology: "Cultural & performance centre",
    summary:
      "A centre for performance and learning, with a timber-ribbed auditorium, bright rehearsal halls and a terracotta front.",
    description: [
      "D.A.S.A Rangamandira puts an auditorium, rehearsal and workshop halls, a conference room and offices under one roof.",
      "The front of the building is terracotta-red brick and sage plaster, with white folk-art patterns. Inside, curved timber ribs shape the auditorium ceiling, and the long rehearsal halls get plenty of daylight, with traditional paintings on the walls.",
    ],
    features: ["Auditorium with timber-ribbed ceiling", "Day-lit rehearsal halls", "Folk-art façade motifs", "Planted circulation aisles"],
    renders: true,
    cover: { k: D + "facade", alt: "Visualisation of the D.A.S.A Rangamandira entrance: terracotta brick façade with white folk-art motifs", render: true },
    gallery: [
      { k: D + "road-side-elevation", alt: "Visualisation of the road-side elevation with a sage-green patterned wall and landscaped approach", render: true },
      { k: D + "2", alt: "Visualisation of the auditorium: curved timber ceiling ribs above a stage and audience", render: true },
      { k: D + "a1", alt: "Visualisation of the auditorium seating seen from the stage", render: true },
      { k: D + "ebec152c", alt: "Visualisation of a rehearsal hall with dancers, musicians and traditional paintings", render: true },
      { k: D + "2f1f39bb", alt: "Visualisation of a long workshop hall with timber tables and bamboo blinds", render: true },
      { k: D + "front-aisle-2", alt: "Visualisation of the front aisle: an entry lounge with a sculpture and planted borders", render: true },
      { k: D + "front-aisle-3", alt: "Visualisation of the front aisle opening to greenery through full-height glass", render: true },
      { k: D + "side-aisle-a1", alt: "Visualisation of a side aisle lined with traditional paintings above a planter", render: true },
      { k: D + "side-aisle-b2", alt: "Visualisation of a stair and planted aisle under a slatted timber ceiling", render: true },
      { k: D + "admin-1", alt: "Visualisation of the reception and lounge with a live-edge table and portraits", render: true },
      { k: D + "conference-1", alt: "Visualisation of the conference room with a long timber table", render: true },
      { k: D + "ff-landing-1", alt: "Visualisation of the first-floor landing with art and a planter", render: true },
    ],
  },
  {
    slug: "banavara-vedike",
    title: "Banavara Vedike",
    location: "Banavara, Karnataka",
    status: "ongoing",
    typology: "Community dining hall & guest house",
    client: "SKSSP Trust",
    summary:
      "A dining hall and a guest house, Guru Nivasa, built the traditional way with Mangalore-tile roofs, brick jaali walls and local materials.",
    description: [
      "Banavara Vedike is for SKSSP Trust. It has two buildings: a 40′ × 60′ dining hall (bhojanalaya) and Guru Nivasa, a two-storey guest house.",
      "Both use the building traditions of the region: Mangalore-tile roofs, brick jaali walls, simple columns, and exposed brick mixed with plaster. Local materials, louvres for shade and airflow, and good cross-ventilation and daylight keep them comfortable without depending on machines.",
    ],
    features: ["Mangalore-tile roofs", "Brick jaali walls", "Brick and plaster combination", "Local materials", "Louvres for airflow and shade"],
    renders: true,
    cover: { k: B + "dining-hall-1", alt: "Visualisation of the Banavara dining hall: brick jaali upper storey under a Mangalore-tile roof", render: true },
    gallery: [
      { k: B + "dining-hall-2", alt: "Visualisation of the dining hall front elevation with jaali panels and colonnade", render: true },
      { k: B + "dining-hall-4", alt: "Aerial visualisation of the dining hall's hipped Mangalore-tile roof", render: true },
      { k: B + "dining-hall-3", alt: "Visualisation of the dining hall side elevation with louvred windows", render: true },
      { k: B + "guru-nivasa-1", alt: "Visualisation of Guru Nivasa: brick and plaster volumes under sloping tiled roofs", render: true },
      { k: B + "guru-nivasa-3", alt: "Aerial visualisation of Guru Nivasa with its layered tiled roofs", render: true },
      { k: B + "guru-nivasa-4", alt: "Visualisation of Guru Nivasa with a spiral stair and window shades", render: true },
      { k: B + "guru-nivasa-2", alt: "Visualisation of Guru Nivasa's plastered front with timber windows", render: true },
    ],
  },
  {
    slug: "me-riise-foundation",
    title: "ME RIISE Foundation",
    location: "Malnad College of Engineering, Hassan",
    status: "ongoing",
    typology: "Institutional building",
    summary:
      "A two-storey building for the ME RIISE Foundation on the Malnad College of Engineering campus.",
    description: [
      "An institutional building for the ME RIISE Foundation at Malnad College of Engineering, Hassan.",
      "The two-storey front is a steady rhythm of piers and long bands of glass. A deep canopy over the entrance and a planted forecourt make arriving feel easy.",
    ],
    features: ["Gridded façade with glazing bands", "Deep entrance canopy", "Landscaped forecourt"],
    renders: true,
    cover: { k: M + "exterior-2", alt: "Visualisation of the ME RIISE Foundation building corner with gold lettering and a planted forecourt", render: true },
    gallery: [
      { k: M + "exterior-3", alt: "Visualisation of the main entrance under a deep canopy", render: true },
      { k: M + "exterior-1", alt: "Visualisation of the side elevation with a colonnade and glazing bands", render: true },
      { k: M + "exterior-4", alt: "Visualisation of the full front elevation framed by trees", render: true },
    ],
  },
  {
    slug: "veena-mahesh-home",
    title: "Veena-Mahesh Home",
    location: "Kengeri, Bengaluru",
    status: "ongoing",
    typology: "Residence",
    summary:
      "A house with rounded corners and perforated screens outside, and warm timber and a sage-green kitchen inside.",
    description: [
      "A family home in Kengeri. The corners of the house curve into rounded balconies, wrapped in perforated screens that filter light and views.",
      "Inside, there is timber joinery, a sage-green kitchen and large windows that keep the rooms bright.",
    ],
    features: ["Curved balconies and screens", "Timber joinery", "Sage kitchen", "Daylit living spaces"],
    renders: true,
    cover: { k: V + "view-c", alt: "Visualisation of the Veena-Mahesh Home with curved balconies and an arched gateway", render: true },
    gallery: [
      { k: V + "view-a", alt: "Visualisation of the curved corner elevation with perforated screens", render: true },
      { k: V + "view-b", alt: "Visualisation of the front elevation with rounded terraces", render: true },
      { k: V + "view-1", alt: "Visualisation of the living room with a timber floor console and patterned rug", render: true },
      { k: V + "view-2", alt: "Visualisation of the living and dining area with a curved wall", render: true },
      { k: V + "view-14", alt: "Visualisation of the double-height living space and dining table", render: true },
      { k: V + "view-11", alt: "Visualisation of the sage-green kitchen with dark stone counters", render: true },
      { k: V + "view-16", alt: "Visualisation of a bedroom with a timber bookshelf wall", render: true },
      { k: V + "view-5", alt: "Visualisation of a bedroom with timber wardrobe and cane headboard", render: true },
    ],
  },
  {
    slug: "dinesh-home",
    title: "Mr. Dinesh Home",
    location: "Ullala, Bengaluru",
    status: "ongoing",
    typology: "Residence",
    scope: "Residential building and interiors",
    summary:
      "Bedrooms and a kitchen in light timber and woven textures, with sheer curtains that let the morning light in.",
    description: [
      "A family residence in Ullala. The visualisations here show its interiors.",
      "The bedrooms have woven-texture wall panels, light timber beds and wardrobes, and sheer curtains, which keeps them calm and full of daylight. The kitchen uses the same timber.",
    ],
    features: ["Woven-texture wall panelling", "Light timber joinery", "Sheer, layered window treatments"],
    renders: true,
    cover: { k: N + "kbra1", alt: "Visualisation of a bedroom with woven-texture panels, timber bed and a wide window", render: true },
    gallery: [
      { k: N + "gbr1", alt: "Visualisation of a bedroom with a patterned wardrobe and woven wall panels", render: true },
      { k: N + "gbr3", alt: "Visualisation of a bedroom with a tall window and indoor palm", render: true },
      { k: N + "kbra2", alt: "Visualisation of a bedroom with a dark wardrobe wall and framed art", render: true },
      { k: N + "kbrb2", alt: "Visualisation of a bedroom with a skylight and timber platform bed", render: true },
      { k: N + "kitchen-1", alt: "Visualisation of the timber kitchen with open shelves and a frosted window", render: true },
    ],
  },
  {
    slug: "jakkur-office",
    title: "Office at Jakkur",
    location: "Jakkur, Bengaluru",
    status: "ongoing",
    typology: "Office building",
    summary:
      "A compact office in brick and white plaster, shaded by vertical fins, with a covered terrace on the roof.",
    description: [
      "An office building in Jakkur. A brick core is wrapped in white plastered floors, and a row of vertical fins shades the glass from the sun.",
      "A tensile canopy turns the roof into usable outdoor space. At night, lights wash over the fins.",
    ],
    features: ["Vertical shading fins", "Brick and white plaster", "Canopied roof terrace", "Façade lighting"],
    renders: true,
    cover: { k: J + "ele-6", alt: "Night visualisation of the Jakkur office with light washing its vertical fins", render: true },
    gallery: [
      { k: J + "ele-2", alt: "Visualisation of the street elevation with vertical fins over brick", render: true },
      { k: J + "ele-3", alt: "Visualisation of the corner with a brick volume and white plastered bands", render: true },
      { k: J + "ele-4", alt: "Visualisation of the rear with the tensile roof canopy", render: true },
      { k: J + "ele-1", alt: "Aerial visualisation of the office with its roof terrace", render: true },
      { k: J + "ele-5", alt: "Aerial night visualisation of the lit fins and roof", render: true },
    ],
  },
];

export const completed = projects.filter((p) => p.status === "completed");
export const ongoing = projects.filter((p) => p.status === "ongoing");
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

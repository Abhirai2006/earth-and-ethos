// Before / after pairs for the slider. The first entry is a placeholder made
// from a real project photo (traced as a line drawing). Replace it with real
// before/after site photos, e.g. Gautham R Avadhani's rebuild, once supplied:
// add both photos to ../_raw/stories/, run `npm run images`, and edit below.
export type Story = {
  title: string;
  caption: string;
  before: { k: string; label: string; alt: string };
  after: { k: string; label: string; alt: string };
  illustration?: boolean;
};

export const stories: Story[] = [
  {
    title: "From a line to a lived-in home",
    caption: "Athreya Mane, Padmanabhanagar. Drag across to move between the drawing and the finished house.",
    before: { k: "stories/athreya-line", label: "Line study", alt: "Athreya Mane traced as a pen line drawing" },
    after: { k: "stories/athreya-photo", label: "Built", alt: "Athreya Mane at dusk, with its brick jaali stair screen lit from within" },
    illustration: true,
  },
];

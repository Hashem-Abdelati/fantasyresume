export type Artifact = "hall" | "book" | "satchel" | "raven";
export const chapters = [
  { to: "/about", label: "Character", context: "About me", numeral: "I" },
  { to: "/projects", label: "Quests", context: "Projects", numeral: "II" },
  {
    to: "/experience",
    label: "Journey",
    context: "Experience",
    numeral: "III",
  },
] as const;
export const navigation = [
  { to: "/hub", label: "Grand Hall", context: "Home" },
  ...chapters,
  { to: "/contact", label: "Raven", context: "Contact" },
  { to: "/inventory", label: "Inventory", context: "Personal artifacts" },
];
export function artifactFor(path: string): Artifact {
  if (chapters.some((c) => c.to === path)) return "book";
  return path === "/inventory"
    ? "satchel"
    : path === "/contact"
      ? "raven"
      : "hall";
}
export const contact = {
  email: "abdelatihashem@gmail.com",
  linkedin: "https://www.linkedin.com/in/hashem-abdelati/",
  github: "https://github.com/Hashem-Abdelati",
};

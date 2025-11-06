
export type DescriptionIcon = "EmojiPeople" | "Room" | "DeveloperBoard" | "Code" | "Email" | "Create" | "RssFeed";

export interface Description {
  icon: DescriptionIcon;
  label: string;
  href: string;
}

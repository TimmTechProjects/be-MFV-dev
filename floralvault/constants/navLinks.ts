interface authUserLinks {
  label: string;
  href: string;
  icon?: string;
}

export const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "The Vault",
    href: "/the-vault",
  },
  {
    label: "My Collection",
    href: "/my-collection",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
  },
];

export const authUserLinks: authUserLinks[] = [
  {
    label: "Notifications",
    href: "/notifications",
    icon: "/icons/noti-bell.svg",
  },
  {
    label: "Messages",
    href: "/messages",
    icon: "/icons/messages.svg",
  },
];

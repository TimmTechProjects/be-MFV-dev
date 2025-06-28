interface authUserLinks {
  label: string;
  href: string;
  icon?: string;
}

export const navLinks = [
  // {
  //   label: "Home",
  //   href: "/",
  // },
  {
    label: "The Vault",
    href: "/the-vault",
  },
  {
    label: "Garden Builds",
    href: "/garden-builds",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  {
    label: "My Collection",
    href: "/my-collection",
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

export const site = {
  name: "Boldux Art",
  legalName: "Boldux Art",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://boldux.ca",
  shopUrl: "https://shop.boldux.ca",
  email: "info@boldux.ca",
  region: "Québec, Canada",
  founder: "Stéphane Bolduc",
  foundingDate: "2023-07",
  social: {
    instagram: "https://www.instagram.com/bolduxart/",
    facebook: "https://www.facebook.com/bolduxart/",
  },
  // Theme colour for browsers / PWA
  themeColor: "#07070a",
} as const;

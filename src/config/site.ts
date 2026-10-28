export const site = {
  name: "Boldux Art",
  legalName: "Boldux Art",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolduxart.com",
  shopUrl: "https://shop.bolduxart.com",
  email: "info@bolduxart.com",
  phone: "+13673805441",
  phoneDisplay: "367-380-5441",
  region: "Québec, Canada",
  foundingDate: "2023-07",
  social: {
    instagram: "https://www.instagram.com/bolduxart/",
    facebook: "https://www.facebook.com/bolduxart/",
  },
  // Theme colour for browsers / PWA
  themeColor: "#07070a",
} as const;

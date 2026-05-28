export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "bluenode2026";
export const EVENTS_STORAGE_KEY = "bluenode-upcoming-events";
export const PROGRAMS_STORAGE_KEY = "bluenode-programs";
export const SOCIAL_LINKS_STORAGE_KEY = "bluenode-social-links";
export const ADMIN_SESSION_KEY = "bluenode-admin-auth";
export const HOME_HERO_IMAGE_ID = "1BPdzTrpajXolvDUkDgVBZmLxW7VLiqiG";
export const socialIconOptions = ["facebook", "instagram", "x", "linkedin", "youtube", "tiktok", "whatsapp", "email"];

export const defaultEvents = [
  {
    id: "event-school-drive",
    title: "Back-to-School Support Drive",
    location: "Abeokuta, Ogun State",
    dateTime: "2026-06-20T10:00",
    description: "Distribution of school supplies and learning materials for children in underserved communities.",
    flyerImage: "/assets/images/Bluenode.jpg"
  },
  {
    id: "event-medical-outreach",
    title: "Community Medical Outreach",
    location: "Obantoko, Abeokuta",
    dateTime: "2026-07-05T09:00",
    description: "Free checkups, health screening, and medication support for families and elderly residents.",
    flyerImage: "/assets/images/Bluenode.jpg"
  }
];

export const navItems = [
  { label: "Home", href: "#home", route: "home" },
  { label: "About", href: "#about", route: "about" },
  { label: "Programs", href: "#programs", route: "programs" },
  { label: "Events", href: "#events", route: "events" },
  { label: "Impact", href: "#impact", route: "impact" },
  { label: "Contact", href: "#contact", route: "contact" },
  { label: "Socials", href: "#socials", route: "socials" }
];

export const quickLinks = [
  { label: "About Blue Node", href: "#about", kicker: "Learn who we are" },
  { label: "Our Programs", href: "#programs", kicker: "Explore outreach areas" },
  { label: "Impact Stories", href: "#impact", kicker: "See the numbers" },
  { label: "Contact Us", href: "#contact", kicker: "Partner or support" }
];

export const aboutCards = [
  {
    title: "Who we are",
    body:
      "Founded on 28 December 2021 by Ayorinde Jolaosho, Blue Node Foundation is a non-governmental, non-profit organization serving underprivileged children, individuals, and families."
  },
  {
    title: "Our vision",
    body:
      "To build communities where people can live with dignity, access opportunity, and grow beyond poverty through education, care, and support."
  },
  {
    title: "Our mission",
    body:
      "We provide education support, healthcare outreach, humanitarian relief, and empowerment programs that create lasting change across underserved communities in Nigeria."
  }
];

export const teamMembers = [
  {
    name: "Aisha Bello",
    post: "Executive Director",
    imageId: "162a4Li42i5tDZT2fOF2Yie6-rJhLxVpD"
  },
  {
    name: "Tunde Akinyemi",
    post: "Programs Lead",
    imageId: "1lKs1X5RZADW7lOLPShgxodc0svs2WU2G"
  },
  {
    name: "Maryam Sani",
    post: "Outreach Coordinator",
    imageId: "121afMcxqZH84x5t58lnUpf4aveu2AftY"
  },
  {
    name: "David Okafor",
    post: "Partnerships Lead",
    imageId: "1uDZobCxTKM4LEL89oDxoK1DIOemRjiND"
  },
  {
    name: "Chioma Nwosu",
    post: "Communications Lead",
    imageId: "13aU-XwstyGFJ061Xj0UHm6vhUuiFqHAC"
  },
  {
    name: "Ibrahim Musa",
    post: "Volunteer Lead",
    imageId: "1cKs8W_9gtBS8oMFyc05oyPUcA1sMz2Zf"
  },
  {
    name: "Esther Peter",
    post: "Education Officer",
    imageId: "1tgnoJ0tEVJ8eQJHbTLSx1Tf7y2RRzo-U"
  },
  {
    name: "Oluwaseun Adeyemi",
    post: "Health Outreach Lead",
    imageId: "1ZAPZE7zig_cMbFAnWUGyjoW8RpCHys2r"
  },
  {
    name: "Zainab Hassan",
    post: "Operations Manager",
    imageId: "1nVD61yfhpMus86xps6TlcOvz5Taboor2"
  },
  {
    name: "Kingsley Eze",
    post: "Media Coordinator",
    imageId: "1bVw1AH2DRb0FMHbV_m2uVUACBvBshBtr"
  }
];

export const defaultPrograms = [
  {
    slug: "school-outreach",
    title: "School Outreach",
    body:
      "Scholarships, school supplies, and learning support that help children stay in school and keep moving forward.",
    imageId: "1BPdzTrpajXolvDUkDgVBZmLxW7VLiqiG",
    galleryImageIds: [
      "162a4Li42i5tDZT2fOF2Yie6-rJhLxVpD",
      "1lKs1X5RZADW7lOLPShgxodc0svs2WU2G",
      "121afMcxqZH84x5t58lnUpf4aveu2AftY",
      "1uDZobCxTKM4LEL89oDxoK1DIOemRjiND",
      "13aU-XwstyGFJ061Xj0UHm6vhUuiFqHAC",
      "1cKs8W_9gtBS8oMFyc05oyPUcA1sMz2Zf",
      "1tgnoJ0tEVJ8eQJHbTLSx1Tf7y2RRzo-U",
      "1ZAPZE7zig_cMbFAnWUGyjoW8RpCHys2r",
      "1nVD61yfhpMus86xps6TlcOvz5Taboor2",
      "1bVw1AH2DRb0FMHbV_m2uVUACBvBshBtr",
      "1qpu0do47c2RYrrNRzxN_WvOwTlalQACV",
      "1yGDUBrFRNGzOGm77yHq0eoWJEPOK8d5T",
      "1_XwHt1Q1U-6k4H1SCJGch3DmliHb_5QW",
      "1BijWspMXQtveKcqCXyH-aMYdiFUxNOVs",
      "1p8HtC1bBihqTmiQlVllIWXcrKYmJokm5",
      "1e7ywD2YGXCa08xY9kqYqABhOcnvaF4Lk",
      "1Mw8JqgtMh7MHtix3HHSct-xrFtiZUqY1",
      "10GLOq-kav4EFdOfnG6djU8FO1LixUeFy",
      "1BPdzTrpajXolvDUkDgVBZmLxW7VLiqiG"
    ]
  },
  {
    slug: "healthcare-outreach",
    title: "Healthcare Outreach",
    body:
      "Free checkups, medication support, and health awareness campaigns that bring care closer to people who need it most.",
    imageId: "18FepQKZvltHDqKYce44beLEkGtrviHH1",
    galleryImageIds: [
      "1dT-pP7CNtq4IbwT4WNZU2iP1xGn2FYo1",
      "1eCLirnohC6u2bCQAdQL7YROcZbS1HAw2",
      "1fEA8626UliRdgcQTa-yx9umsoOz_8xQ3",
      "1sB-JsIlhr6hNon2v6Mg9F6rIuxyFjsgA",
      "1z7x8b1BxygJUVzFS2mxEQ7HFxsJwdDS5",
      "1CG3ONHfl527X5CEJY0RMqeYTbiNIQXck",
      "1K-X9gsbtdwlTnGRAxZYRRGL8FQLT8b_X",
      "1UsDhsbcj4EN0Ht-2i0YYhqO75Pgs6bFp",
      "1QC84XKtPfaHxKNpwrtczwiI7aKetS_e-",
      "1KCqIRY9RG5iTRE6q02iz9XXi3XGNU1F6",
      "1OmWZ35yDzBNyLvh84mjUqsRddgJ_lEiJ",
      "18AxR4uLlBpMsdcQ7UCMqo6AJh5pQ52l8",
      "1CGFgcOOODlVxWZcuGhW5AmlSn7g2K65I",
      "1VjT5Eu_MpDYCmgUKUTLKv2N0TvJb1ZV8",
      "1PtgiH_u2K2ZANGT2ApTNu0_p5JDpY94S",
      "18FepQKZvltHDqKYce44beLEkGtrviHH1"
    ]
  },
  {
    slug: "skills-empowerment",
    title: "Skills Empowerment",
    body:
      "Practical training, mentorship, and support that help people build confidence, income, and more stable futures.",
    imageId: "1zh25uWTrOmhQ_9424VRMkiR2lUas1hMq",
    galleryImageIds: [
      "1KJvS1xETAgPyM6Hd_wgju9eaHnZHoWgm",
      "1Q9JVEaoRbsgu9RpDi6uP_dGSf-ScAE1f",
      "1jDNU-MXwMa5yjo7_8aD2Bx_Dd3pjrG0D",
      "1QjnR7VJTP1_yOZ2iATcLMftilxuYSbUC",
      "1Vw0fBWx5-BCkpoL0TNvyjDU7kRmGwZpG",
      "15S4unXiXdkBHe0hP643j7S7yAjQHJvT9",
      "1uAUqpaZ7KYBn_UjXEVjg7ZzsDZOPi2T8",
      "1eXeLYULmhN_LyxhosV83emmJwjM99m5M",
      "1Krg_QfPXbUi8wI6Rgjc9HwPCb2o2BoZZ",
      "183asjva1HMib66WA7JbM9S1jK73a6bjk",
      "1TOtwSrd9ZsiMBO3xnLsAFpYSsAKn3aSo",
      "1NQCEQRx5_bqiP-lhYQkeb7m8fuMPkyxW",
      "1zh25uWTrOmhQ_9424VRMkiR2lUas1hMq"
    ]
  },
  {
    slug: "food-outreach",
    title: "Food Outreach",
    body:
      "Food support and feeding drives that bring timely relief to vulnerable households and underserved communities.",
    imageId: "1a7eIGOFwANJjMXGfwHB2AGKqLW04HDaW",
    galleryImageIds: [
      "17fyrPM4CWGxvPdZgm5yw4KUy2BXZ_oTu",
      "1aE7yQV7Q3ZuWjJ-R0_aPzCzmBHHKynhY",
      "1bwXAg2ImtO6wvX5-xrQ2cTorveKu4pq9",
      "1jCsASjYy1j_Uk_pCJzfkm5Li6ZqjIz22",
      "1qbkGp8xzYSeP5cOQUTylhdweohUCIKpb",
      "1SYoYdRExVDnEvsyx0MEiOelkMJdEGdHr",
      "1bmZLzbiYYLX5AE2Pf1No-wCuDQZ_uvN8",
      "18IdhbHYS1b1OXX8yA-yMFuqlV1m-Pt9j",
      "1gWufqVbLK_pJwb2B-HzeX4-Rtji8ZRMx",
      "1MajAcwjgNg72fCOd3wvbx1yHs2tZgxx_",
      "1-T-DPgHCrRqiIKbMenYQZbEHUJRmqRnW",
      "1CLa42ie4Yt-wNfWUy_ypbTW01Uglu9FT",
      "1Io83OtSFsL8xPM9QXDMv7YQsyKczDyZd",
      "1a7eIGOFwANJjMXGfwHB2AGKqLW04HDaW"
    ]
  },
  {
    slug: "wears-outreach",
    title: "Wears Outreach",
    body:
      "Clothing and essential wear distribution that supports children, families, and communities in need.",
    imageId: "1QsHs502oeq7kjTgpS-Mcg_VuPZv9tXjx",
    galleryImageIds: [
      "1EnZyswwh16aXqmXvW-9BhnGZ2G0hDeih",
      "1SAmpFoYj25Q9DpDqVaslo3cD7TpqljqE",
      "1TXoxYmQJx0BBhsg0sA1AVUd3_7Q9Qm8I",
      "1bcLXmAu1zc4PaRJiZmHFWdLF1Tw3YIuD",
      "1F4RpZraoZsPzTWKGl1-6IpQEKFGTwEVW",
      "1QsHs502oeq7kjTgpS-Mcg_VuPZv9tXjx"
    ]
  },
  {
    slug: "environmental-cleanup",
    title: "Environmental Cleanup",
    body:
      "Community clean-up drives and environmental awareness programs that promote healthier, safer, and more beautiful neighborhoods.",
    imageId: "11sIjQYIMM1G_oR1USXLgBGyWTF1eGh1M",
    galleryImageIds: [
      "1g5K0FPuVRZutaqjagqRnG2kXalCMHm_5",
      "19UvG3kTV1FHXWcKQ3v_AfwART-6QszjR",
      "1SKMg34WUUuRaQp5VLaesniZcaFqQ7h8I",
      "1R5HLUgqXimpa-rErEd2ENEwx2Btot4C5",
      "1bIKEvq8UL5gFIRqwiPWQx17kfHzrqSsN",
      "1Ity7XKfnCB19nI_vSwFTSkC4Z-3UNzfO",
      "1HerOU2vuIXNsZZ38gUKGEBSOOVQXQNYR",
      "1e0raaZfSCa9Oon0ccRilUcM2PNT0GEWP",
      "11sIjQYIMM1G_oR1USXLgBGyWTF1eGh1M"
    ]
  }
];

export const impactStats = [
  { value: "900+", label: "Families fed" },
  { value: "1,000+", label: "Children supported in school" },
  { value: "2,000+", label: "People empowered with skills" },
  { value: "5,000+", label: "Lives reached with relief" }
];

export const defaultSocialLinks = [
  {
    id: "social-facebook",
    name: "Facebook",
    href: "https://www.facebook.com/share/1BecctdKCJ/?mibextid=wwXIfr",
    icon: "facebook",
    handle: "Blue Node Foundation",
    description: "Community updates, outreach highlights, and event recaps."
  },
  {
    id: "social-instagram",
    name: "Instagram",
    href: "https://www.instagram.com/bluenodecares?igsh=ZGFxMjMxOWM2eDlt&utm_source=qr",
    icon: "instagram",
    handle: "@bluenodecares",
    description: "Photo stories from outreach visits, volunteer moments, and impact on the ground."
  },
  {
    id: "social-x",
    name: "X",
    href: "https://x.com/bluenodecares?s=21&t=DpVhorY-twqi2aY3z9eBBQ",
    icon: "x",
    handle: "@bluenodecares",
    description: "Announcements, campaign updates, and real-time foundation news."
  },
  {
    id: "social-linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/blue-node-foundation/",
    icon: "linkedin",
    handle: "Blue Node Foundation",
    description: "Partnership opportunities, organization news, and professional updates."
  },
  {
    id: "social-youtube",
    name: "YouTube",
    href: "https://youtube.com/@bluenode?si=HLHUP5KxACg4J_jJ",
    icon: "youtube",
    handle: "@bluenode",
    description: "Video stories, field documentation, and community impact features."
  },
  {
    id: "social-tiktok",
    name: "TikTok",
    href: "https://www.tiktok.com/@bluenodecares?_r=1&_t=ZS-96EnMelePb8",
    icon: "tiktok",
    handle: "@bluenodecares",
    description: "Short-form outreach moments designed for quick sharing and discovery."
  },
  {
    id: "social-whatsapp",
    name: "WhatsApp",
    href: "https://wa.me/2348104963290",
    icon: "whatsapp",
    handle: "+234 810 496 3290",
    description: "Direct contact for enquiries, support coordination, and quick communication."
  },
  {
    id: "social-email",
    name: "Email",
    href: "mailto:bluenodefoundation@gmail.com",
    icon: "email",
    handle: "bluenodefoundation@gmail.com",
    description: "Formal enquiries, collaborations, and partnership communication."
  }
];

export const footerContent = {
  eyebrow: "Social media",
  title: "Stay connected with Blue Node Foundation.",
  description: "Follow the foundation, share the work, and keep up with new outreach activities.",
  loginLabel: "Team login",
  loginHref: "#admin",
  copyrightPrefix: "Blue Node Foundation",
  credit: "Developed by Airis."
};

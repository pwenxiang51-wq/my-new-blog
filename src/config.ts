import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://222382.xyz/", // 改成你的新域名
  author: "Velo.x",
  profile: "https://github.com/pwenxiang51-wq", // ✅ 你的个人主页
  desc: "Velo.x 的个人博客",
  title: "Velo.x",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/pwenxiang51-wq/my-new-blog/edit/main/src/content/blog",
  }
};

export const LOCALE = {
  lang: "zh-CN",
  langTag: ["zh-CN"],
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/pwenxiang51-wq", // ✅ 绝对是你的链接
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Facebook",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Facebook`,
    active: false,
  },
  {
    name: "Instagram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Instagram`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: false, // ❌ 彻底关闭领英
  },
  {
    name: "Mail",
    href: "mailto:pwenxiang51@gmail.com", // ✅ 你的邮箱
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false, // ❌ 关闭推特
  },
  {
    name: "Telegram",
    href: "https://t.me/Velox95", // ✅ 你的 TG
    linkTitle: `${SITE.title} on Telegram`,
    active: true,
  }
];

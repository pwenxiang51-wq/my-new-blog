// ✅ 终极修正版：补全了所有报错缺失的配置项 (lang, timezone, showBackButton 等)

export const SITE = {
  website: "https://222382.xyz/", 
  author: "Velo.x",
  profile: "https://github.com/pwenxiang51-wq",
  desc: "Velo.x 的个人博客",
  title: "Velo.x",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  
  // 👇 刚才报错缺这些，我全部补回来的：
  postPerIndex: 4,      
  dynamicOgImage: true, 
  showBackButton: true, 
  dir: "ltr",           
  lang: "zh-CN",        
  timezone: "Asia/Shanghai", 
  
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

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/pwenxiang51-wq",
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
    active: false,
  },
  {
    name: "Mail",
    href: "mailto:pwenxiang51@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
  {
    name: "Telegram",
    href: "https://t.me/Velox95",
    linkTitle: `${SITE.title} on Telegram`,
    active: true,
  }
];

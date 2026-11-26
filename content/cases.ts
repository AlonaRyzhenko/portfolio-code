export const cases = {
  "secure-messenger": {
    "title": "Secure communication platform",
    "description": "I redesigned a secure B2B messenger so messaging, documents and verification live in one flow, cutting tool-switching and making every action and failure clear."
  },
  "identity-app": {
    "title": "Identity and access app",
    "description": "I designed an identity app from scratch that lets people sign in, sign documents and get access across a B2B fintech ecosystem, approved with Face ID instead of passwords."
  },
  "hr-platform": {
    "title": "HR platform for growing teams",
    "description": "As the only designer, I built an HR platform from first flows to hi-fi, so HR, managers and employees stop switching between spreadsheets, email and separate tools, and each company decides who sees what."
  },
  "defentry": {
    "title": "Defentry",
    "description": "As Defentry’s first designer, I built its design system from scratch and redesigned the logic, so people see their risk and know what to do when an alert comes in, in every partner’s brand."
  }
} as const;
export type Slug = keyof typeof cases;
export const slugs = Object.keys(cases) as Slug[];

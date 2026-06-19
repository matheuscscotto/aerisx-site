import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const IconCamera = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H7l1.2-1.6a1.5 1.5 0 0 1 1.2-.6h4.2a1.5 1.5 0 0 1 1.2.6L16 6h2.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" /><circle cx="12" cy="12.5" r="3.4" /></svg>
);
export const IconVideo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="6.5" width="13" height="11" rx="2" /><path d="M16 10.5l5-3v9l-5-3z" /></svg>
);
export const IconCrane = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 21V4l14 3M5 4l5 1M9 21V8M5 21h8M19 7v4M19 11l-2 2h4z" /></svg>
);
export const IconSun = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" /></svg>
);
export const IconMap = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></svg>
);
export const IconMegaphone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1zM18 8a4 4 0 0 1 0 8" /></svg>
);
export const IconDoc = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" /></svg>
);
export const IconBuilding = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 21h18M5 21V8l5-3v16M14 21V11l5-2v12M8 9h0M8 12h0M8 15h0" /></svg>
);
export const IconHouse = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 11l9-7 9 7M5 9.5V21h14V9.5M9 21v-6h6v6" /></svg>
);
export const IconLeaf = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 20c0-6 3-10 8-11-1 7-4 10-8 11ZM12 20c0-5-2.5-8-7-9 1 6 3 8.5 7 9ZM12 20v-4" /></svg>
);
export const IconFactory = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 21V9l7 4V9l8 4V21zM3 21h18M6.5 13h0M6.5 17h0M13 17h0M17 17h0" /></svg>
);
export const IconDrone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="9" y="9" width="6" height="6" rx="1.4" /><path d="M9 9 5.4 5.4M15 9l3.6-3.6M9 15l-3.6 3.6M15 15l3.6 3.6" /><circle cx="4.4" cy="4.4" r="2.1" /><circle cx="19.6" cy="4.4" r="2.1" /><circle cx="4.4" cy="19.6" r="2.1" /><circle cx="19.6" cy="19.6" r="2.1" /></svg>
);
export const IconBolt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
);
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const IconTarget = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 17l5-5 4 4 8-9" /><path d="M16 7h4v4" /></svg>
);
export const IconStar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 2.5l2.6 6.9H22l-5.8 4.3 2.2 6.8L12 16.4 5.6 20.5l2.2-6.8L2 9.4h7.4z" /></svg>
);
export const IconSliders = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>
);
export const IconWhatsapp = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45zm6.6-3.8c1.68.99 3.06 1.58 4.4 1.58 5.44 0 9.87-4.43 9.88-9.88a9.8 9.8 0 0 0-2.89-7 9.78 9.78 0 0 0-6.98-2.9c-5.45 0-9.88 4.43-9.88 9.88 0 2.07.6 3.62 1.6 5.24l-.99 3.62zM17.4 14.3c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42z" /></svg>
);
export const IconInstagram = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);
export const IconMail = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
export const IconPhone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

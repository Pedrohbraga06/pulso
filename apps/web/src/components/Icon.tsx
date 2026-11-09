import type { SVGProps } from 'react';

export type IconName =
  | 'pulse'
  | 'overview'
  | 'box'
  | 'tag'
  | 'leaf'
  | 'chef'
  | 'warehouse'
  | 'movement'
  | 'alert'
  | 'user'
  | 'building'
  | 'users'
  | 'settings'
  | 'bell'
  | 'search'
  | 'chevron'
  | 'plus'
  | 'trend'
  | 'wallet'
  | 'clock'
  | 'check'
  | 'close'
  | 'menu'
  | 'logout'
  | 'arrow'
  | 'eye'
  | 'filter'
  | 'calendar'
  | 'copy'
  | 'refresh';

const paths: Record<IconName, React.ReactNode> = {
  pulse: <><path d="M3 12h4l3-8 4 16 3-8h4" /><path d="M4 5a9 9 0 1 0 16 0" /></>,
  overview: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
  box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5" /><path d="M3 8v9l9 5 9-5V8" /><path d="M12 13v9" /></>,
  tag: <><path d="M20 13 13 20 4 11V4h7l9 9Z" /><circle cx="8" cy="8" r="1" /></>,
  leaf: <><path d="M20 4c-9 0-15 3-15 10a6 6 0 0 0 6 6c7 0 9-7 9-16Z" /><path d="M5 19c3-4 6-6 11-9" /></>,
  chef: <><path d="M6 10a4 4 0 1 1 3.8-5.2 4.5 4.5 0 0 1 8.5 1.8A3.5 3.5 0 0 1 18 13H6a3 3 0 0 1 0-6" /><path d="M6 13v7h12v-7" /></>,
  warehouse: <><path d="m3 9 9-6 9 6v12H3V9Z" /><path d="M7 21v-7h10v7M8 9h.01M12 9h.01M16 9h.01" /></>,
  movement: <><path d="M7 7h13l-3-3M17 17H4l3 3" /><path d="M20 7v5M4 17v-5" /></>,
  alert: <><path d="m12 3 9 16H3l9-16Z" /><path d="M12 9v4M12 16h.01" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-4h6v4M8 7h1M15 7h1M8 11h1M15 11h1" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7L6.3 16l1.4-1.1A8 8 0 0 1 7.5 13l-1.8-.4v-2.8l1.8-.3a8 8 0 0 1 .8-1.6L6.9 6.4l1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 .2 1.8l1.8.4v2.8l-1.8.3a8 8 0 0 1-.9 1.6Z" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  chevron: <path d="m7 10 5 5 5-5" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 8h18M16 14h.01M7 5V3h11" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" /></>,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

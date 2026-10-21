export type Customer = {
  id: number;
  name: string;
  domain: string;
  contact: string;
  plan: string;
  status: "Active" | "Trial" | "Overdue";
  mrr: number;
  joined: string;
};
export const customers: Customer[] = [
  {
    id: 1,
    name: "Linear Labs",
    domain: "linearlabs.co",
    contact: "Olivia Chen",
    plan: "Scale",
    status: "Active",
    mrr: 1240,
    joined: "Oct 18, 2026",
  },
  {
    id: 2,
    name: "Layers",
    domain: "layers.design",
    contact: "Noah Williams",
    plan: "Growth",
    status: "Active",
    mrr: 490,
    joined: "Oct 16, 2026",
  },
  {
    id: 3,
    name: "Sisyphus",
    domain: "sisyphus.com",
    contact: "Amélie Laurent",
    plan: "Growth",
    status: "Trial",
    mrr: 0,
    joined: "Oct 15, 2026",
  },
  {
    id: 4,
    name: "Quotient",
    domain: "quotient.io",
    contact: "Marcus Reed",
    plan: "Scale",
    status: "Active",
    mrr: 1490,
    joined: "Oct 14, 2026",
  },
  {
    id: 5,
    name: "Circooles",
    domain: "circooles.com",
    contact: "Sofia García",
    plan: "Starter",
    status: "Overdue",
    mrr: 190,
    joined: "Oct 12, 2026",
  },
  {
    id: 6,
    name: "Hourglass",
    domain: "hourglass.app",
    contact: "Ethan Brooks",
    plan: "Growth",
    status: "Active",
    mrr: 490,
    joined: "Oct 10, 2026",
  },
  {
    id: 7,
    name: "Catalog",
    domain: "catalog.studio",
    contact: "Isabella Rossi",
    plan: "Starter",
    status: "Active",
    mrr: 190,
    joined: "Oct 8, 2026",
  },
  {
    id: 8,
    name: "Spherule",
    domain: "spherule.io",
    contact: "Liam Taylor",
    plan: "Scale",
    status: "Active",
    mrr: 1240,
    joined: "Oct 6, 2026",
  },
  {
    id: 9,
    name: "CloudWatch",
    domain: "cloudwatch.dev",
    contact: "Mia Fischer",
    plan: "Growth",
    status: "Overdue",
    mrr: 490,
    joined: "Oct 5, 2026",
  },
  {
    id: 10,
    name: "Peregrine",
    domain: "peregrine.co",
    contact: "Oliver Park",
    plan: "Starter",
    status: "Trial",
    mrr: 0,
    joined: "Oct 3, 2026",
  },
  {
    id: 11,
    name: "Wildflower",
    domain: "wildflower.studio",
    contact: "Ava Johnson",
    plan: "Growth",
    status: "Active",
    mrr: 490,
    joined: "Sep 28, 2026",
  },
  {
    id: 12,
    name: "Boltshift",
    domain: "boltshift.com",
    contact: "Lucas Silva",
    plan: "Scale",
    status: "Active",
    mrr: 990,
    joined: "Sep 24, 2026",
  },
];
export const ranges = ["7D", "30D", "90D"] as const;
export type Range = (typeof ranges)[number];
export const filters = ["All", "Active", "Trial", "Overdue"] as const;
export type Filter = (typeof filters)[number];
export const pages = ["Overview", "Customers", "Reports"] as const;
export type Page = (typeof pages)[number];
export const series: Record<
  Range,
  {
    labels: string[];
    current: number[];
    previous: number[];
    revenue: number;
    growth: string;
    period: string;
  }
> = {
  "7D": {
    labels: [
      "Oct 15",
      "Oct 16",
      "Oct 17",
      "Oct 18",
      "Oct 19",
      "Oct 20",
      "Oct 21",
    ],
    current: [1210, 1540, 1390, 1780, 1640, 2010, 1880],
    previous: [1080, 1240, 1330, 1410, 1350, 1640, 1530],
    revenue: 11450,
    growth: "19.5%",
    period: "Oct 15 – 21, 2026",
  },
  "30D": {
    labels: [
      "Sep 22",
      "Sep 25",
      "Sep 28",
      "Oct 1",
      "Oct 4",
      "Oct 7",
      "Oct 10",
      "Oct 13",
      "Oct 16",
      "Oct 19",
      "Oct 21",
    ],
    current: [2530, 2910, 2760, 3420, 3180, 3880, 3620, 4590, 4110, 5120, 4660],
    previous: [
      2400, 2550, 2680, 2800, 2600, 3050, 2890, 3200, 3100, 3600, 3900,
    ],
    revenue: 40780,
    growth: "24.4%",
    period: "Sep 22 – Oct 21, 2026",
  },
  "90D": {
    labels: [
      "Jul 24",
      "Aug 1",
      "Aug 8",
      "Aug 15",
      "Aug 22",
      "Sep 1",
      "Sep 8",
      "Sep 15",
      "Sep 22",
      "Oct 1",
      "Oct 8",
      "Oct 15",
      "Oct 21",
    ],
    current: [
      6500, 7100, 6900, 7800, 7300, 8500, 8100, 9300, 8800, 9900, 10600, 11200,
      12780,
    ],
    previous: [
      5600, 6100, 5900, 6700, 6500, 7100, 6800, 7500, 7200, 8200, 8500, 9100,
      10000,
    ],
    revenue: 114780,
    growth: "20.6%",
    period: "Jul 24 – Oct 21, 2026",
  },
};
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

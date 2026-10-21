export type Period = '7d' | '30d' | '90d'
export type Payment = 'Paid' | 'Pending' | 'Refunded'
export type Filter = 'All orders' | Payment
export type Page = 'overview' | 'orders' | 'analytics'

export const reports = {
  '7d': {
    revenue: 12384,
    orders: 148,
    average: 83.68,
    conversion: '3.8%',
    growth: '+14.2%',
    orderGrowth: '+8.8%',
    range: 'Oct 15 – 21, 2026',
    comparison: 'vs. previous 7 days',
    labels: [
      'Oct 15',
      'Oct 16',
      'Oct 17',
      'Oct 18',
      'Oct 19',
      'Oct 20',
      'Oct 21',
    ],
    current: [1320, 1840, 1510, 2100, 1724, 2010, 1880],
    previous: [1250, 1440, 1630, 1480, 1500, 1710, 1834],
  },
  '30d': {
    revenue: 48294,
    orders: 574,
    average: 84.14,
    conversion: '3.6%',
    growth: '+12.8%',
    orderGrowth: '+9.2%',
    range: 'Sep 22 – Oct 21, 2026',
    comparison: 'vs. previous 30 days',
    labels: [
      'Sep 22',
      'Sep 25',
      'Sep 28',
      'Oct 1',
      'Oct 4',
      'Oct 7',
      'Oct 10',
      'Oct 13',
      'Oct 16',
      'Oct 19',
      'Oct 21',
    ],
    current: [2780, 3200, 3620, 3180, 4020, 3860, 4930, 4760, 5300, 5814, 6830],
    previous: [
      2410, 2850, 3120, 3540, 3310, 3620, 3980, 4470, 4610, 4980, 5920,
    ],
  },
  '90d': {
    revenue: 137620,
    orders: 1680,
    average: 81.92,
    conversion: '3.4%',
    growth: '+18.4%',
    orderGrowth: '+15.1%',
    range: 'Jul 24 – Oct 21, 2026',
    comparison: 'vs. previous 90 days',
    labels: [
      'Jul 24',
      'Aug 1',
      'Aug 9',
      'Aug 17',
      'Aug 25',
      'Sep 2',
      'Sep 10',
      'Sep 18',
      'Sep 26',
      'Oct 4',
      'Oct 12',
      'Oct 21',
    ],
    current: [
      7200, 8310, 9240, 10120, 9780, 11020, 10200, 11980, 12340, 14060, 15920,
      17450,
    ],
    previous: [
      6200, 7080, 8510, 9240, 9100, 9800, 10310, 10800, 12200, 11920, 13700,
      15360,
    ],
  },
} satisfies Record<Period, object>

export type Order = Readonly<{
  id: string
  name: string
  email: string
  initials: string
  product: string
  date: string
  amount: number
  payment: Payment
  fulfillment: 'Fulfilled' | 'Unfulfilled'
  location: string
}>
export const orders: ReadonlyArray<Order> = [
  {
    id: 'NS-1048',
    name: 'Olivia Martin',
    email: 'olivia.martin@gmail.com',
    initials: 'OM',
    product: 'Weekender Tote · Sand',
    date: 'Oct 21, 2026',
    amount: 128,
    payment: 'Paid',
    fulfillment: 'Unfulfilled',
    location: 'Portland, OR',
  },
  {
    id: 'NS-1047',
    name: 'Jackson Lee',
    email: 'jackson.lee@outlook.com',
    initials: 'JL',
    product: 'Everyday Backpack · Ink',
    date: 'Oct 21, 2026',
    amount: 189,
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    location: 'Austin, TX',
  },
  {
    id: 'NS-1046',
    name: 'Sophia Chen',
    email: 'sophia.chen@gmail.com',
    initials: 'SC',
    product: 'Canvas Pouch · Moss',
    date: 'Oct 21, 2026',
    amount: 42,
    payment: 'Pending',
    fulfillment: 'Unfulfilled',
    location: 'Seattle, WA',
  },
  {
    id: 'NS-1045',
    name: 'Noah Williams',
    email: 'noah.williams@hey.com',
    initials: 'NW',
    product: 'Weekender Tote · Ink',
    date: 'Oct 20, 2026',
    amount: 128,
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    location: 'Brooklyn, NY',
  },
  {
    id: 'NS-1044',
    name: 'Emma Thompson',
    email: 'emma.thompson@gmail.com',
    initials: 'ET',
    product: 'Everyday Backpack · Moss',
    date: 'Oct 20, 2026',
    amount: 189,
    payment: 'Refunded',
    fulfillment: 'Fulfilled',
    location: 'Denver, CO',
  },
  {
    id: 'NS-1043',
    name: 'Liam Patel',
    email: 'liam.patel@icloud.com',
    initials: 'LP',
    product: 'Canvas Pouch · Sand',
    date: 'Oct 20, 2026',
    amount: 84,
    payment: 'Paid',
    fulfillment: 'Unfulfilled',
    location: 'Chicago, IL',
  },
  {
    id: 'NS-1042',
    name: 'Ava Garcia',
    email: 'ava.garcia@gmail.com',
    initials: 'AG',
    product: 'Weekender Tote · Moss',
    date: 'Oct 19, 2026',
    amount: 128,
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    location: 'San Diego, CA',
  },
  {
    id: 'NS-1041',
    name: 'Ethan Davis',
    email: 'ethan.davis@outlook.com',
    initials: 'ED',
    product: 'Everyday Backpack · Sand',
    date: 'Oct 19, 2026',
    amount: 189,
    payment: 'Pending',
    fulfillment: 'Unfulfilled',
    location: 'Boston, MA',
  },
  {
    id: 'NS-1040',
    name: 'Isabella Wilson',
    email: 'isabella.wilson@gmail.com',
    initials: 'IW',
    product: 'Canvas Pouch · Ink',
    date: 'Oct 18, 2026',
    amount: 42,
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    location: 'San Francisco, CA',
  },
  {
    id: 'NS-1039',
    name: 'Mason Brown',
    email: 'mason.brown@hey.com',
    initials: 'MB',
    product: 'Weekender Tote · Sand',
    date: 'Oct 18, 2026',
    amount: 256,
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    location: 'Nashville, TN',
  },
  {
    id: 'NS-1038',
    name: 'Mia Robinson',
    email: 'mia.robinson@gmail.com',
    initials: 'MR',
    product: 'Everyday Backpack · Ink',
    date: 'Oct 17, 2026',
    amount: 189,
    payment: 'Refunded',
    fulfillment: 'Fulfilled',
    location: 'Minneapolis, MN',
  },
  {
    id: 'NS-1037',
    name: 'Lucas Kim',
    email: 'lucas.kim@icloud.com',
    initials: 'LK',
    product: 'Canvas Pouch · Moss',
    date: 'Oct 17, 2026',
    amount: 42,
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    location: 'Los Angeles, CA',
  },
]
export const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
export const wholeMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
export const csvHref = (rows: ReadonlyArray<Order>) =>
  'data:text/csv;charset=utf-8,' +
  encodeURIComponent(
    [
      [
        'Order',
        'Customer',
        'Email',
        'Product',
        'Date',
        'Amount (USD)',
        'Payment',
        'Fulfillment',
      ],
      ...rows.map((row) => [
        row.id,
        row.name,
        row.email,
        row.product,
        row.date,
        row.amount,
        row.payment,
        row.fulfillment,
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
      )
      .join('\r\n'),
  )

export const reportCsvHref = (period: Period) => {
  const report = reports[period]
  return (
    'data:text/csv;charset=utf-8,' +
    encodeURIComponent(
      [
        ['Northstar Commerce report', report.range],
        ['Currency', 'USD'],
        ['Revenue', report.revenue],
        ['Orders', report.orders],
        ['Average order value', report.average],
        ['Conversion rate', report.conversion],
        [],
        ['Period ending', 'Revenue (USD)', 'Previous period revenue (USD)'],
        ...report.labels.map((date, index) => [
          date,
          report.current[index],
          report.previous[index],
        ]),
      ]
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
            .join(','),
        )
        .join('\r\n'),
    )
  )
}

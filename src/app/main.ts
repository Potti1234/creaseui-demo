import { Schema as S } from 'effect'
import { Runtime, type Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { icon } from '@/ui/icon'
import * as Sidebar from '@/ui/sidebar'
import * as Card from '@/ui/card'
import * as Table from '@/ui/table'
import * as Chart from '@/ui/chart'
import * as Empty from '@/ui/empty'
import { stack, stackItem } from '@/ui/stack'
import { grid } from '@/ui/grid'
import { heading } from '@/ui/heading'
import { text } from '@/ui/text'
import { stat } from '@/ui/stat'
import { button, buttonLink } from '@/ui/button'
import { badge } from '@/ui/badge'
import { input } from '@/ui/input'
import { checkbox } from '@/ui/checkbox'
import { toggleGroup } from '@/ui/toggle-group'
import { paginationPages } from '@/ui/pagination'
import { avatar, avatarFallback } from '@/ui/avatar'
import { progress } from '@/ui/progress'
import { statusDot } from '@/ui/status-dot'
import { separator } from '@/ui/separator'
import {
  reports,
  orders,
  money,
  wholeMoney,
  csvHref,
  reportCsvHref,
  type Period,
  type Filter,
  type Page,
  type Order,
} from './data'

const Model = S.Struct({
  period: S.Literals(['7d', '30d', '90d']),
  screen: S.Literals(['overview', 'orders', 'analytics']),
  query: S.String,
  filter: S.Literals(['All orders', 'Paid', 'Pending', 'Refunded']),
  page: S.Number,
  sort: S.Literals(['newest', 'high', 'low']),
  selected: S.Array(S.String),
  expanded: S.String,
  fulfilled: S.Array(S.String),
  sidebarOpen: S.Boolean,
  mobileOpen: S.Boolean,
  chartError: S.String,
})
type Model = typeof Model.Type
type Message =
  | { _tag: 'PickedPeriod'; period: Period }
  | { _tag: 'Navigated'; screen: Page }
  | { _tag: 'Searched'; query: string }
  | { _tag: 'Filtered'; filter: Filter }
  | { _tag: 'Paged'; page: number }
  | { _tag: 'Sorted' }
  | { _tag: 'Selected'; id: string; checked: boolean }
  | { _tag: 'SelectedPage'; checked: boolean }
  | { _tag: 'Expanded'; id: string }
  | { _tag: 'Fulfilled'; id: string }
  | { _tag: 'ResetFilters' }
  | { _tag: 'ToggledSidebar' }
  | { _tag: 'ToggledMobile' }
  | Chart.ChartMessage

const pageSize = 6
const matchingOrders = (model: Model): ReadonlyArray<Order> =>
  orders
    .map((order) =>
      model.fulfilled.includes(order.id)
        ? { ...order, fulfillment: 'Fulfilled' as const }
        : order,
    )
    .filter(
      (order) =>
        model.filter === 'All orders' || order.payment === model.filter,
    )
    .filter((order) =>
      [order.id, order.name, order.email, order.product].some((value) =>
        value.toLowerCase().includes(model.query.toLowerCase().trim()),
      ),
    )
    .sort((a, b) =>
      model.sort === 'high'
        ? b.amount - a.amount
        : model.sort === 'low'
          ? a.amount - b.amount
          : b.id.localeCompare(a.id),
    )
const visibleOrders = (model: Model) =>
  matchingOrders(model).slice(
    (model.page - 1) * pageSize,
    model.page * pageSize,
  )

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'PickedPeriod':
      return {
        model: { ...model, period: message.period },
        commands: [
          Chart.SyncChart({ hostId: 'revenue-chart', variant: message.period }),
        ],
      }
    case 'Navigated':
      return { model: { ...model, screen: message.screen, mobileOpen: false } }
    case 'Searched':
      return {
        model: {
          ...model,
          query: message.query,
          page: 1,
          expanded: '',
          selected: [],
        },
      }
    case 'Filtered':
      return {
        model: {
          ...model,
          filter: message.filter,
          page: 1,
          expanded: '',
          selected: [],
        },
      }
    case 'Paged':
      return {
        model: {
          ...model,
          page: Math.max(
            1,
            Math.min(
              message.page,
              Math.ceil(matchingOrders(model).length / pageSize) || 1,
            ),
          ),
          expanded: '',
        },
      }
    case 'Sorted':
      return {
        model: {
          ...model,
          sort:
            model.sort === 'newest'
              ? 'high'
              : model.sort === 'high'
                ? 'low'
                : 'newest',
          page: 1,
        },
      }
    case 'Selected':
      return {
        model: {
          ...model,
          selected: message.checked
            ? [...new Set([...model.selected, message.id])]
            : model.selected.filter((id) => id !== message.id),
        },
      }
    case 'SelectedPage':
      return {
        model: {
          ...model,
          selected: message.checked
            ? [
                ...new Set([
                  ...model.selected,
                  ...visibleOrders(model).map((order) => order.id),
                ]),
              ]
            : model.selected.filter(
                (id) => !visibleOrders(model).some((order) => order.id === id),
              ),
        },
      }
    case 'Expanded':
      return {
        model: {
          ...model,
          expanded: model.expanded === message.id ? '' : message.id,
        },
      }
    case 'Fulfilled':
      return {
        model: {
          ...model,
          fulfilled: [...new Set([...model.fulfilled, message.id])],
        },
      }
    case 'ResetFilters':
      return {
        model: {
          ...model,
          query: '',
          filter: 'All orders',
          page: 1,
          sort: 'newest',
        },
      }
    case 'ToggledSidebar':
      return { model: { ...model, sidebarOpen: !model.sidebarOpen } }
    case 'ToggledMobile':
      return { model: { ...model, mobileOpen: !model.mobileOpen } }
    case 'ChartMountFailed':
      return { model: { ...model, chartError: message.reason } }
    case 'ChartMounted':
    case 'CompletedSyncChart':
      return { model }
  }
}

Chart.registerChart('revenue-chart', (theme, variant) => {
  const report =
    reports[variant === '7d' || variant === '90d' ? variant : '30d']
  return {
    animationDuration: 450,
    textStyle: { fontFamily: theme.fontFamily },
    grid: { left: 52, right: 16, top: 20, bottom: 32 },
    tooltip: {
      ...Chart.tooltipOptions(theme),
      trigger: 'axis',
      valueFormatter: (value) => wholeMoney(Number(value)),
    },
    xAxis: Chart.categoryAxis(theme, report.labels, {
      axisLabel: { fontSize: 11 },
    }),
    yAxis: {
      ...Chart.valueAxis(theme, {
        showLabels: true,
        axisLabel: {
          formatter: (value) => `$${Number(value) / 1000}k`,
          fontSize: 11,
        },
      }),
      min: 0,
      splitNumber: 4,
    },
    series: [
      {
        name: 'Previous period',
        type: 'line',
        data: report.previous,
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { color: theme.chart2, width: 2, type: 'dashed' },
        itemStyle: { color: theme.chart2 },
      },
      {
        name: 'Revenue',
        type: 'line',
        data: report.current,
        smooth: 0.3,
        symbol: 'circle',
        showSymbol: false,
        symbolSize: 7,
        lineStyle: { color: theme.chart1, width: 3 },
        itemStyle: { color: theme.chart1 },
        areaStyle: {
          color: Chart.areaGradient(theme.chart1, { from: 0.16, to: 0.01 }),
        },
      },
    ],
  }
})

const label = (value: string, h: HtmlBuilder<Message>) =>
  text({ children: [value], color: 'secondary', type: 'supporting' }, h)
const person = (initials: string, h: HtmlBuilder<Message>) =>
  avatar({ children: [avatarFallback({ children: [initials] }, h)] }, h)

const navigation = (model: Model, h: HtmlBuilder<Message>) =>
  Sidebar.sidebar(
    {
      state: model.sidebarOpen ? 'expanded' : 'collapsed',
      collapsible: 'icon',
      isMobileOpen: model.mobileOpen,
      onMobileDismiss: { _tag: 'ToggledMobile' },
      children: [
        Sidebar.sidebarHeader(
          {
            children: [
              Sidebar.sidebarMenu(
                {
                  children: [
                    Sidebar.sidebarMenuItem(
                      {
                        children: [
                          Sidebar.sidebarMenuButton(
                            {
                              size: 'lg',
                              tooltip: 'Northstar Commerce',
                              isStatic: true,
                              children: [
                                icon({ name: 'star' }, h),
                                stack(
                                  {
                                    gap: 0,
                                    children: [
                                      text(
                                        {
                                          children: ['Northstar'],
                                          weight: 'semibold',
                                        },
                                        h,
                                      ),
                                      label('COMMERCE', h),
                                    ],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Sidebar.sidebarContent(
          {
            children: [
              Sidebar.sidebarGroup(
                {
                  children: [
                    Sidebar.sidebarGroupLabel({ children: ['Workspace'] }, h),
                    Sidebar.sidebarMenu(
                      {
                        children: [
                          {
                            screen: 'overview' as const,
                            title: 'Overview',
                            icon: 'layout-dashboard' as const,
                          },
                          {
                            screen: 'orders' as const,
                            title: 'Orders',
                            icon: 'shopping-cart' as const,
                          },
                          {
                            screen: 'analytics' as const,
                            title: 'Analytics',
                            icon: 'chart-no-axes-combined' as const,
                          },
                        ].map((item) =>
                          Sidebar.sidebarMenuItem(
                            {
                              children: [
                                Sidebar.sidebarMenuButton(
                                  {
                                    isActive: model.screen === item.screen,
                                    onClick: {
                                      _tag: 'Navigated',
                                      screen: item.screen,
                                    },
                                    tooltip: item.title,
                                    children: [
                                      icon({ name: item.icon }, h),
                                      text(
                                        {
                                          children: [item.title],
                                          type: 'inherit',
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                                ...(item.screen === 'orders'
                                  ? [
                                      Sidebar.sidebarMenuBadge(
                                        { children: ['12'] },
                                        h,
                                      ),
                                    ]
                                  : []),
                              ],
                            },
                            h,
                          ),
                        ),
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Sidebar.sidebarFooter(
          {
            children: [
              stack(
                {
                  variant: 'sidebar-status',
                  gap: 3,
                  children: [
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 2,
                        children: [
                          statusDot(
                            { variant: 'success', label: 'Store is live' },
                            h,
                          ),
                          text(
                            {
                              children: ['Your store is live'],
                              type: 'supporting',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    separator({}, h),
                  ],
                },
                h,
              ),
              Sidebar.sidebarMenu(
                {
                  children: [
                    Sidebar.sidebarMenuItem(
                      {
                        children: [
                          Sidebar.sidebarMenuButton(
                            {
                              size: 'lg',
                              tooltip: 'Alex Morgan · Store owner',
                              isStatic: true,
                              children: [
                                person('AM', h),
                                stack(
                                  {
                                    gap: 0,
                                    children: [
                                      text(
                                        {
                                          children: ['Alex Morgan'],
                                          weight: 'medium',
                                        },
                                        h,
                                      ),
                                      label('Store owner', h),
                                    ],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Sidebar.sidebarRail({ onClick: { _tag: 'ToggledSidebar' } }, h),
      ],
    },
    h,
  )

const metrics = (model: Model, h: HtmlBuilder<Message>) => {
  const report = reports[model.period]
  return grid(
    {
      columns: { minWidth: 190, max: 4 },
      gap: 4,
      children: [
        {
          label: 'Total revenue',
          value: wholeMoney(report.revenue),
          delta: report.growth,
          icon: 'banknote' as const,
        },
        {
          label: 'Orders',
          value: report.orders.toLocaleString('en-US'),
          delta: report.orderGrowth,
          icon: 'shopping-cart' as const,
        },
        {
          label: 'Average order value',
          value: money(report.average),
          delta: '+3.3%',
          icon: 'file-text' as const,
        },
        {
          label: 'Conversion rate',
          value: report.conversion,
          delta: '+0.4 pts',
          icon: 'mouse-pointer-2' as const,
        },
      ].map((metric) =>
        Card.card(
          {
            size: 'sm',
            children: [
              Card.cardContent(
                {
                  children: [
                    stack(
                      {
                        direction: 'horizontal',
                        justify: 'between',
                        align: 'center',
                        children: [
                          label(metric.label, h),
                          icon({ name: metric.icon }, h),
                        ],
                      },
                      h,
                    ),
                    stat(
                      {
                        label: '',
                        value: metric.value,
                        size: 'lg',
                        delta: { value: metric.delta, direction: 'up' },
                        description: report.comparison,
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ),
    },
    h,
  )
}

const revenue = (model: Model, h: HtmlBuilder<Message>) => {
  const report = reports[model.period]
  return Card.card(
    {
      class: 'min-w-0 flex-1',
      children: [
        Card.cardHeader(
          {
            children: [
              Card.cardTitle(
                { element: 'h2', children: ['Revenue over time'] },
                h,
              ),
              Card.cardDescription(
                { children: ['A little momentum, every day.'] },
                h,
              ),
              Card.cardAction(
                {
                  children: [
                    badge(
                      {
                        variant: 'outline',
                        children: [
                          icon({ name: 'trending-up' }, h),
                          report.growth,
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.cardContent(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  gap: 4,
                  children: [
                    Chart.chartLegend(
                      {
                        config: {
                          revenue: {
                            label: 'This period',
                            color: 'var(--chart-1)',
                          },
                          previous: {
                            label: 'Previous period',
                            color: 'var(--chart-2)',
                          },
                        },
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Chart.eChart(
                {
                  hostId: 'revenue-chart',
                  dataSize: 'dashboard',
                  variant: model.period,
                  ariaLabel: `Revenue for ${report.range}. Total ${wholeMoney(report.revenue)}.`,
                  state: model.chartError ? 'error' : 'ready',
                  statusText: model.chartError
                    ? 'The revenue chart could not load. The figures are available below.'
                    : undefined,
                  toMessage: (message) => message,
                  accessibleAlternative: Table.table(
                    {
                      ariaLabel: 'Revenue chart data',
                      isFocusable: false,
                      children: [
                        Table.tableHeader(
                          {
                            children: [
                              Table.tableRow(
                                {
                                  children: [
                                    'Date',
                                    'Revenue',
                                    'Previous period',
                                  ].map((value) =>
                                    Table.tableHead({ children: [value] }, h),
                                  ),
                                },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                        Table.tableBody(
                          {
                            children: report.labels.map((date, index) =>
                              Table.tableRow(
                                {
                                  children: [
                                    date,
                                    wholeMoney(report.current[index]),
                                    wholeMoney(report.previous[index]),
                                  ].map((value) =>
                                    Table.tableCell({ children: [value] }, h),
                                  ),
                                },
                                h,
                              ),
                            ),
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.cardFooter(
          {
            children: [
              icon({ name: 'arrow-up-right' }, h),
              text(
                {
                  children: [
                    `Revenue is ${report.growth.slice(1)} ahead of the previous period`,
                  ],
                  type: 'supporting',
                  class: 'ml-2',
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

const products = (model: Model, h: HtmlBuilder<Message>) =>
  Card.card(
    {
      class: 'w-full xl:w-80',
      children: [
        Card.cardHeader(
          {
            children: [
              Card.cardTitle({ element: 'h2', children: ['Top products'] }, h),
              Card.cardDescription(
                { children: ['The pieces customers come back for.'] },
                h,
              ),
            ],
          },
          h,
        ),
        Card.cardContent(
          {
            children: [
              ...[
                {
                  title: 'Everyday Backpack',
                  category: 'Bags & carry',
                  icon: 'package' as const,
                  value: 46,
                },
                {
                  title: 'Weekender Tote',
                  category: 'Bags & carry',
                  icon: 'shopping-cart' as const,
                  value: 35,
                },
                {
                  title: 'Canvas Pouch',
                  category: 'Accessories',
                  icon: 'wallet' as const,
                  value: 19,
                },
              ].map((product) =>
                stack(
                  {
                    gap: 2,
                    children: [
                      stack(
                        {
                          direction: 'horizontal',
                          gap: 3,
                          align: 'center',
                          children: [
                            avatar(
                              {
                                size: 'lg',
                                children: [
                                  avatarFallback(
                                    {
                                      children: [
                                        icon({ name: product.icon }, h),
                                      ],
                                    },
                                    h,
                                  ),
                                ],
                              },
                              h,
                            ),
                            stackItem(
                              {
                                size: 'fill',
                                children: [
                                  stack(
                                    {
                                      gap: 0,
                                      children: [
                                        text(
                                          {
                                            children: [product.title],
                                            weight: 'medium',
                                          },
                                          h,
                                        ),
                                        label(product.category, h),
                                      ],
                                    },
                                    h,
                                  ),
                                ],
                              },
                              h,
                            ),
                            text(
                              {
                                children: [
                                  wholeMoney(
                                    (reports[model.period].revenue *
                                      product.value) /
                                      100,
                                  ),
                                ],
                                hasTabularNumbers: true,
                                weight: 'medium',
                                type: 'supporting',
                                color: 'primary',
                              },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                      progress(
                        {
                          value: product.value,
                          ariaLabel: `${product.title}: ${product.value}% of revenue`,
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ),
            ],
          },
          h,
        ),
        Card.cardFooter(
          {
            children: [
              text(
                {
                  children: ['Share of total revenue · USD'],
                  type: 'supporting',
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const orderDetails = (order: Order, h: HtmlBuilder<Message>) =>
  Table.tableRow(
    {
      children: [
        Table.tableCell(
          {
            colspan: 8,
            children: [
              stack(
                {
                  padding: 4,
                  direction: 'horizontal',
                  wrap: 'wrap',
                  justify: 'between',
                  align: 'center',
                  gap: 4,
                  children: [
                    stack(
                      {
                        gap: 1,
                        children: [
                          text(
                            { children: [order.product], weight: 'medium' },
                            h,
                          ),
                          label(
                            `Ships to ${order.location} · Standard delivery · ${order.email}`,
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    order.fulfillment === 'Unfulfilled' &&
                    order.payment === 'Paid'
                      ? button(
                          {
                            variant: 'outline',
                            leadingIcon: icon({ name: 'check' }, h),
                            children: ['Mark fulfilled'],
                            onClick: { _tag: 'Fulfilled', id: order.id },
                          },
                          h,
                        )
                      : badge(
                          {
                            variant: 'secondary',
                            children: [
                              order.payment === 'Pending'
                                ? 'Awaiting payment'
                                : order.payment === 'Refunded'
                                  ? 'Refund processed'
                                  : 'Ready for delivery',
                            ],
                          },
                          h,
                        ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const ordersTable = (model: Model, h: HtmlBuilder<Message>) => {
  const filtered = matchingOrders(model)
  const visible = visibleOrders(model)
  const selectedOnPage = visible.filter((order) =>
    model.selected.includes(order.id),
  ).length
  const exportRows = model.selected.length
    ? matchingOrders(model).filter((order) => model.selected.includes(order.id))
    : filtered
  return Card.card(
    {
      children: [
        Card.cardHeader(
          {
            children: [
              Card.cardTitle({ element: 'h2', children: ['Recent orders'] }, h),
              Card.cardDescription(
                {
                  children: ['Keep a pulse on your latest customer activity.'],
                },
                h,
              ),
              Card.cardAction(
                {
                  children: [
                    buttonLink(
                      {
                        href: csvHref(exportRows),
                        download: 'northstar-orders.csv',
                        variant: 'outline',
                        size: 'sm',
                        leadingIcon: icon({ name: 'download' }, h),
                        children: [
                          model.selected.length
                            ? `Export selected (${exportRows.length})`
                            : 'Export CSV',
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.cardContent(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  justify: 'between',
                  align: 'center',
                  wrap: 'wrap',
                  gap: 3,
                  children: [
                    toggleGroup(
                      {
                        ariaLabel: 'Filter orders by payment status',
                        value: model.filter,
                        size: 'sm',
                        onToggle: (filter): Message => ({
                          _tag: 'Filtered',
                          filter,
                        }),
                        items: (
                          ['All orders', 'Paid', 'Pending', 'Refunded'] as const
                        ).map((value) => ({ value, children: [value] })),
                      },
                      h,
                    ),
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 2,
                        class: 'w-full sm:w-64',
                        children: [
                          input(
                            {
                              id: 'order-search',
                              value: model.query,
                              onInput: (query): Message => ({
                                _tag: 'Searched',
                                query,
                              }),
                              placeholder: 'Search orders…',
                              type: 'search',
                              ariaLabel:
                                'Search orders by name, ID, email, or product',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              filtered.length
                ? Table.table(
                    {
                      ariaLabel: 'Recent customer orders',
                      children: [
                        Table.tableHeader(
                          {
                            children: [
                              Table.tableRow(
                                {
                                  children: [
                                    Table.tableHead(
                                      {
                                        children: [
                                          checkbox(
                                            {
                                              id: 'select-orders',
                                              isChecked:
                                                selectedOnPage ===
                                                visible.length,
                                              isIndeterminate:
                                                selectedOnPage > 0 &&
                                                selectedOnPage < visible.length,
                                              label: text(
                                                {
                                                  children: [
                                                    'Select this page',
                                                  ],
                                                  isVisuallyHidden: true,
                                                },
                                                h,
                                              ),
                                              onToggle: (checked): Message => ({
                                                _tag: 'SelectedPage',
                                                checked,
                                              }),
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    ...[
                                      'Order',
                                      'Customer',
                                      'Date',
                                      'Payment',
                                      'Fulfillment',
                                    ].map((value) =>
                                      Table.tableHead({ children: [value] }, h),
                                    ),
                                    Table.tableHead(
                                      {
                                        children: [
                                          button(
                                            {
                                              variant: 'ghost',
                                              size: 'sm',
                                              ariaLabel: `Sort by amount: ${model.sort === 'newest' ? 'newest first' : model.sort === 'high' ? 'highest first' : 'lowest first'}`,
                                              onClick: { _tag: 'Sorted' },
                                              children: ['Amount'],
                                              trailingIcon: icon(
                                                {
                                                  name:
                                                    model.sort === 'high'
                                                      ? 'arrow-down'
                                                      : model.sort === 'low'
                                                        ? 'arrow-up'
                                                        : 'arrow-down-up',
                                                },
                                                h,
                                              ),
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableHead(
                                      {
                                        children: [
                                          text(
                                            {
                                              children: ['Details'],
                                              isVisuallyHidden: true,
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                  ],
                                },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                        Table.tableBody(
                          {
                            children: visible.flatMap((order) => [
                              Table.tableRow(
                                {
                                  children: [
                                    Table.tableCell(
                                      {
                                        children: [
                                          checkbox(
                                            {
                                              id: `select-${order.id}`,
                                              isChecked:
                                                model.selected.includes(
                                                  order.id,
                                                ),
                                              label: text(
                                                {
                                                  children: [
                                                    `Select ${order.id}`,
                                                  ],
                                                  isVisuallyHidden: true,
                                                },
                                                h,
                                              ),
                                              onToggle: (checked): Message => ({
                                                _tag: 'Selected',
                                                id: order.id,
                                                checked,
                                              }),
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        children: [
                                          text(
                                            {
                                              children: [
                                                `#${order.id.split('-')[1]}`,
                                              ],
                                              weight: 'medium',
                                              hasTabularNumbers: true,
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        children: [
                                          stack(
                                            {
                                              direction: 'horizontal',
                                              gap: 3,
                                              align: 'center',
                                              children: [
                                                person(order.initials, h),
                                                stack(
                                                  {
                                                    gap: 0,
                                                    children: [
                                                      text(
                                                        {
                                                          children: [
                                                            order.name,
                                                          ],
                                                          weight: 'medium',
                                                        },
                                                        h,
                                                      ),
                                                      label(order.email, h),
                                                    ],
                                                  },
                                                  h,
                                                ),
                                              ],
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        children: [
                                          text(
                                            {
                                              children: [order.date],
                                              color: 'secondary',
                                              hasTabularNumbers: true,
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        children: [
                                          badge(
                                            {
                                              variant:
                                                order.payment === 'Paid'
                                                  ? 'paid'
                                                  : order.payment === 'Pending'
                                                    ? 'pending'
                                                    : 'secondary',
                                              children: [order.payment],
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        children: [
                                          text(
                                            {
                                              children: [order.fulfillment],
                                              color: 'secondary',
                                              type: 'supporting',
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        align: 'end',
                                        children: [
                                          text(
                                            {
                                              children: [money(order.amount)],
                                              hasTabularNumbers: true,
                                              weight: 'medium',
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                    Table.tableCell(
                                      {
                                        children: [
                                          button(
                                            {
                                              variant: 'ghost',
                                              size: 'icon-sm',
                                              ariaLabel: `${model.expanded === order.id ? 'Close' : 'View'} order ${order.id}`,
                                              onClick: {
                                                _tag: 'Expanded',
                                                id: order.id,
                                              },
                                              ariaExpanded:
                                                model.expanded === order.id,
                                              children: [
                                                icon(
                                                  {
                                                    name:
                                                      model.expanded ===
                                                      order.id
                                                        ? 'chevron-up'
                                                        : 'chevron-right',
                                                  },
                                                  h,
                                                ),
                                              ],
                                            },
                                            h,
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                  ],
                                },
                                h,
                              ),
                              ...(model.expanded === order.id
                                ? [orderDetails(order, h)]
                                : []),
                            ]),
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  )
                : Empty.empty(
                    {
                      children: [
                        Empty.emptyHeader(
                          {
                            children: [
                              Empty.emptyMedia(
                                {
                                  variant: 'icon',
                                  children: [icon({ name: 'search' }, h)],
                                },
                                h,
                              ),
                              Empty.emptyTitle(
                                { children: ['No orders found'] },
                                h,
                              ),
                              Empty.emptyDescription(
                                {
                                  children: [
                                    'Try a different search or clear your filters to see all orders.',
                                  ],
                                },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                        Empty.emptyContent(
                          {
                            children: [
                              button(
                                {
                                  variant: 'outline',
                                  children: ['Clear filters'],
                                  onClick: { _tag: 'ResetFilters' },
                                },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
            ],
          },
          h,
        ),
        Card.cardFooter(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  justify: 'between',
                  wrap: 'wrap',
                  gap: 3,
                  class: 'w-full',
                  children: [
                    label(
                      filtered.length
                        ? `Showing ${(model.page - 1) * pageSize + 1}–${Math.min(model.page * pageSize, filtered.length)} of ${filtered.length} orders${model.selected.length ? ` · ${model.selected.length} selected` : ''}`
                        : '0 orders',
                      h,
                    ),
                    stack(
                      {
                        children: [
                          paginationPages(
                            {
                              page: model.page,
                              totalPages:
                                Math.ceil(filtered.length / pageSize) || 1,
                              ariaLabel: 'Order pages',
                              navigation: {
                                kind: 'action',
                                onNavigate: (page): Message => ({
                                  _tag: 'Paged',
                                  page,
                                }),
                              },
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const report = reports[model.period]
  const title =
    model.screen === 'overview'
      ? 'Overview'
      : model.screen === 'orders'
        ? 'Orders'
        : 'Analytics'
  return Sidebar.sidebarProvider(
    {
      width: '15rem',
      iconWidth: '4rem',
      state: model.sidebarOpen ? 'expanded' : 'collapsed',
      children: [
        navigation(model, h),
        Sidebar.sidebarInset(
          {
            class: 'min-w-0',
            children: [
              stack(
                {
                  as: 'header',
                  direction: 'horizontal',
                  align: 'center',
                  justify: 'between',
                  paddingInline: 6,
                  paddingBlock: 4,
                  gap: 4,
                  children: [
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 3,
                        children: [
                          Sidebar.sidebarTrigger(
                            {
                              onClick: { _tag: 'ToggledSidebar' },
                              onMobileClick: { _tag: 'ToggledMobile' },
                            },
                            h,
                          ),
                          label('Workspace', h),
                          icon({ name: 'chevron-right' }, h),
                          text(
                            {
                              children: [title],
                              type: 'supporting',
                              color: 'primary',
                              weight: 'medium',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    badge(
                      {
                        variant: 'outline',
                        children: [
                          statusDot(
                            { variant: 'success', label: 'Sample data' },
                            h,
                          ),
                          'Demo store',
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              separator({}, h),
              stack(
                {
                  variant: 'page',
                  gap: 6,
                  children: [
                    stack(
                      {
                        direction: 'horizontal',
                        justify: 'between',
                        align: 'center',
                        wrap: 'wrap',
                        gap: 4,
                        children: [
                          stack(
                            {
                              gap: 1,
                              children: [
                                heading(
                                  {
                                    level: 1,
                                    children: [title],
                                    textWrap: 'balance',
                                  },
                                  h,
                                ),
                                text(
                                  {
                                    children: [
                                      model.screen === 'overview'
                                        ? 'Welcome back, Alex. Here’s how your store is doing.'
                                        : model.screen === 'orders'
                                          ? 'Every order, from checkout to doorstep.'
                                          : 'Understand the numbers behind your growth.',
                                    ],
                                    color: 'secondary',
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          buttonLink(
                            {
                              href: reportCsvHref(model.period),
                              download: 'northstar-report.csv',
                              leadingIcon: icon({ name: 'download' }, h),
                              children: ['Export report'],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    ...(model.screen !== 'orders'
                      ? [
                          stack(
                            {
                              direction: 'horizontal',
                              justify: 'between',
                              align: 'center',
                              wrap: 'wrap',
                              gap: 3,
                              children: [
                                stack(
                                  {
                                    direction: 'horizontal',
                                    align: 'center',
                                    gap: 2,
                                    children: [
                                      icon({ name: 'calendar-days' }, h),
                                      text(
                                        {
                                          children: [report.range],
                                          type: 'supporting',
                                          color: 'primary',
                                          hasTabularNumbers: true,
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                                toggleGroup(
                                  {
                                    ariaLabel: 'Reporting period',
                                    value: model.period,
                                    variant: 'outline',
                                    size: 'sm',
                                    onToggle: (period): Message => ({
                                      _tag: 'PickedPeriod',
                                      period,
                                    }),
                                    items: [
                                      { value: '7d', children: ['7 days'] },
                                      { value: '30d', children: ['30 days'] },
                                      { value: '90d', children: ['90 days'] },
                                    ],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          metrics(model, h),
                          stack(
                            {
                              variant: 'report',
                              gap: 6,
                              children: [revenue(model, h), products(model, h)],
                            },
                            h,
                          ),
                        ]
                      : []),
                    ...(model.screen !== 'analytics'
                      ? [ordersTable(model, h)]
                      : [
                          Card.card(
                            {
                              children: [
                                Card.cardHeader(
                                  {
                                    children: [
                                      Card.cardTitle(
                                        {
                                          element: 'h2',
                                          children: [
                                            'Steady growth, by the numbers',
                                          ],
                                        },
                                        h,
                                      ),
                                      Card.cardDescription(
                                        {
                                          children: [
                                            'Your strongest products are making an impact.',
                                          ],
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                                Card.cardContent(
                                  {
                                    children: [
                                      text(
                                        {
                                          children: [
                                            `${report.orders.toLocaleString()} orders generated ${wholeMoney(report.revenue)} in revenue for ${report.range}. Everyday Backpack accounts for 46% of sales, followed by Weekender Tote at 35%.`,
                                          ],
                                          textWrap: 'pretty',
                                        },
                                        h,
                                      ),
                                      text(
                                        {
                                          children: [
                                            `The ${report.conversion} store conversion rate is up 0.4 percentage points over the previous period.`,
                                          ],
                                          color: 'secondary',
                                          textWrap: 'pretty',
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                        ]),
                    stack(
                      {
                        as: 'footer',
                        direction: 'horizontal',
                        justify: 'between',
                        wrap: 'wrap',
                        gap: 2,
                        children: [
                          label(
                            'Northstar Commerce · Thoughtfully made, every day.',
                            h,
                          ),
                          label('Sample store data · All amounts in USD', h),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

const init: Runtime.ElementInit<Model, Message> = () => ({
  model: {
    period: '30d',
    screen: 'overview',
    query: '',
    filter: 'All orders',
    page: 1,
    sort: 'newest',
    selected: [],
    expanded: '',
    fulfilled: [],
    sidebarOpen: true,
    mobileOpen: false,
    chartError: '',
  },
})

export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init,
      update,
      view,
      container: document.getElementById('root'),
      devTools: false,
    }),
  )

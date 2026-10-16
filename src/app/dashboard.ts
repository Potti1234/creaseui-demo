import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { modifyFields } from 'foldkit/struct'

import { card, cardContent, cardHeader, cardTitle } from '@/ui/stylex/card'
import { barChart, chartContainer } from '@/ui/stylex/chart'
import { grid } from '@/ui/stylex/grid'
import { heading } from '@/ui/stylex/heading'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInset,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarProvider,
  sidebarTrigger,
} from '@/ui/stylex/sidebar'
import { stack } from '@/ui/stylex/stack'
import { stat } from '@/ui/stylex/stat'
import {
  table,
  tableBody,
  tableCell,
  tableHead,
  tableHeader,
  tableRow,
} from '@/ui/stylex/table'
import { text } from '@/ui/stylex/text'

// MODEL

const Screen = S.Union([S.Literal('overview'), S.Literal('customers')])
type Screen = typeof Screen.Type

export const Model = S.Struct({
  isMobileOpen: S.Boolean,
  isSidebarOpen: S.Boolean,
  screen: Screen,
})
export type Model = typeof Model.Type

// MESSAGE

export const Message = defineMessageUnion({
  DismissedMobileSidebar: {},
  SelectedScreen: { screen: Screen },
  ToggledMobileSidebar: {},
  ToggledSidebar: {},
})
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  isMobileOpen: false,
  isSidebarOpen: true,
  screen: 'overview',
})

// UPDATE

type UpdateReturn = Update.Return<Model, Message>

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      DismissedMobileSidebar: () => ({
        model: modifyFields(model, { isMobileOpen: () => false }),
      }),
      SelectedScreen: ({ screen }) => ({
        model: modifyFields(model, {
          isMobileOpen: () => false,
          screen: () => screen,
        }),
      }),
      ToggledMobileSidebar: () => ({
        model: modifyFields(model, { isMobileOpen: current => !current }),
      }),
      ToggledSidebar: () => ({
        model: modifyFields(model, { isSidebarOpen: current => !current }),
      }),
    }),
  )

// VIEW

const SCREENS: ReadonlyArray<Readonly<{ screen: Screen; label: string }>> = [
  { screen: 'overview', label: 'Overview' },
  { screen: 'customers', label: 'Customers' },
]

const STATS = [
  { label: 'Total revenue', value: '$1.28M', delta: { value: '+12.4%', direction: 'up' } },
  { label: 'Active customers', value: '2,350', delta: { value: '+4.1%', direction: 'up' } },
  { label: 'Error rate', value: '0.42%', delta: { value: '-0.08%', direction: 'down' } },
] as const

const MONTHS = [
  { label: 'Jan', value: 186 },
  { label: 'Feb', value: 305 },
  { label: 'Mar', value: 237 },
  { label: 'Apr', value: 273 },
  { label: 'May', value: 209 },
  { label: 'Jun', value: 314 },
] as const

const REGIONS = [
  { region: 'Europe', revenue: '$412k', share: '32%' },
  { region: 'Americas', revenue: '$655k', share: '51%' },
  { region: 'Asia Pacific', revenue: '$213k', share: '17%' },
] as const

const CUSTOMERS = [
  { name: 'Olivia Martin', plan: 'Enterprise', spend: '$1,999.00' },
  { name: 'Jackson Lee', plan: 'Pro', spend: '$39.00' },
  { name: 'Isabella Nguyen', plan: 'Pro', spend: '$299.00' },
  { name: 'William Kim', plan: 'Starter', spend: '$99.00' },
] as const

const dataTable = (
  ariaLabel: string,
  columns: ReadonlyArray<string>,
  rows: ReadonlyArray<ReadonlyArray<string>>,
  h: HtmlBuilder<Message>,
): Html =>
  table(
    {
      ariaLabel,
      children: [
        tableHeader(
          {
            children: [
              tableRow(
                { children: columns.map(column => tableHead({ children: [column] }, h)) },
                h,
              ),
            ],
          },
          h,
        ),
        tableBody(
          {
            children: rows.map(row =>
              tableRow({ children: row.map(cell => tableCell({ children: [cell] }, h)) }, h),
            ),
          },
          h,
        ),
      ],
    },
    h,
  )

const navigation = (model: Model, h: HtmlBuilder<Message>): Html =>
  sidebar(
    {
      state: model.isSidebarOpen ? 'expanded' : 'collapsed',
      isMobileOpen: model.isMobileOpen,
      onMobileDismiss: Message.DismissedMobileSidebar(),
      children: [
        sidebarHeader({ children: [heading({ level: 4, children: ['Acme Inc.'] }, h)] }, h),
        sidebarContent(
          {
            children: [
              sidebarGroup(
                {
                  children: [
                    sidebarGroupLabel({ children: ['Platform'] }, h),
                    sidebarMenu(
                      {
                        children: SCREENS.map(entry =>
                          sidebarMenuItem(
                            {
                              children: [
                                sidebarMenuButton(
                                  {
                                    isActive: model.screen === entry.screen,
                                    onClick: Message.SelectedScreen({ screen: entry.screen }),
                                    children: [entry.label],
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

const overview = (h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  grid(
    {
      columns: 3,
      gap: 4,
      children: STATS.map(entry =>
        card(
          {
            children: [
              cardContent(
                { children: [stat({ label: entry.label, value: entry.value, delta: entry.delta }, h)] },
                h,
              ),
            ],
          },
          h,
        ),
      ),
    },
    h,
  ),
  card(
    {
      children: [
        cardHeader({ children: [cardTitle({ children: ['Monthly revenue'] }, h)] }, h),
        cardContent(
          {
            children: [
              chartContainer(
                {
                  ariaLabel: 'Monthly revenue',
                  config: { value: { label: 'Revenue', color: 'var(--chart-1)' } },
                  children: [barChart({ data: MONTHS }, h)],
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
  dataTable(
    'Revenue by region',
    ['Region', 'Revenue', 'Share'],
    REGIONS.map(row => [row.region, row.revenue, row.share]),
    h,
  ),
]

const customers = (h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  dataTable(
    'Customers',
    ['Customer', 'Plan', 'Spend'],
    CUSTOMERS.map(row => [row.name, row.plan, row.spend]),
    h,
  ),
]

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const current = SCREENS.find(entry => entry.screen === model.screen) ?? SCREENS[0]
  return sidebarProvider(
    {
      state: model.isSidebarOpen ? 'expanded' : 'collapsed',
      children: [
        navigation(model, h),
        sidebarInset(
          {
            children: [
              stack(
                {
                  gap: 6,
                  padding: 6,
                  children: [
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 2,
                        children: [
                          sidebarTrigger(
                            {
                              onClick: Message.ToggledSidebar(),
                              onMobileClick: Message.ToggledMobileSidebar(),
                            },
                            h,
                          ),
                          heading({ level: 2, children: [current?.label ?? ''] }, h),
                        ],
                      },
                      h,
                    ),
                    text({ color: 'secondary', children: ['Last 30 days'] }, h),
                    ...(model.screen === 'overview' ? overview(h) : customers(h)),
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

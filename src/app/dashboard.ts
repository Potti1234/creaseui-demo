import type { Html, HtmlBuilder } from 'foldkit/html'

import { barChart, chartContainer } from '@/ui/pleat/chart'
import { heading } from '@/ui/pleat/heading'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarProvider,
} from '@/ui/pleat/sidebar'
import { stack } from '@/ui/pleat/stack'
import { stat } from '@/ui/pleat/stat'
import {
  table,
  tableBody,
  tableCell,
  tableHead,
  tableHeader,
  tableRow,
} from '@/ui/pleat/table'
import { text } from '@/ui/pleat/text'

const STATS = [
  { label: 'Total revenue', value: '$1.28M', delta: { value: '+12.4%', direction: 'up' } },
  { label: 'Error rate', value: '0.42%', delta: { value: '-0.08%', direction: 'down' } },
] as const
const REGIONS = [
  { region: 'Europe', revenue: '$412k' },
  { region: 'Americas', revenue: '$655k' },
] as const
const MONTHS = [
  { label: 'Jan', value: 186 },
  { label: 'Feb', value: 305 },
  { label: 'Mar', value: 237 },
] as const

const navigation = <M>(h: HtmlBuilder<M>): Html =>
  sidebar(
    {
      collapsible: 'none',
      children: [
        sidebarContent(
          {
            children: [
              sidebarGroup(
                {
                  children: [
                    sidebarMenu(
                      {
                        children: ['Overview', 'Customers'].map((label, index) =>
                          sidebarMenuItem(
                            {
                              children: [
                                sidebarMenuButton(
                                  { href: '#' + label.toLowerCase(), isActive: index === 0, children: [label] },
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

const regions = <M>(h: HtmlBuilder<M>): Html =>
  table(
    {
      ariaLabel: 'Revenue by region',
      children: [
        tableHeader(
          {
            children: [
              tableRow(
                {
                  children: [
                    tableHead({ children: ['Region'] }, h),
                    tableHead({ children: ['Revenue'] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        tableBody(
          {
            children: REGIONS.map(row =>
              tableRow(
                {
                  children: [
                    tableCell({ children: [row.region] }, h),
                    tableCell({ children: [row.revenue] }, h),
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
  )

export const dashboardView = <M>(h: HtmlBuilder<M>): Html =>
  sidebarProvider(
    {
      children: [
        navigation(h),
        stack(
          {
            gap: 4,
            children: [
              heading({ level: 2, children: ['Overview'] }, h),
              text({ color: 'secondary', children: ['Last 30 days'] }, h),
              stack(
                {
                  direction: 'horizontal',
                  gap: 4,
                  children: STATS.map(entry =>
                    stat({ label: entry.label, value: entry.value, delta: entry.delta }, h),
                  ),
                },
                h,
              ),
              chartContainer(
                {
                  ariaLabel: 'Monthly revenue',
                  config: { value: { label: 'Revenue', color: 'var(--chart-1)' } },
                  children: [barChart({ data: MONTHS }, h)],
                },
                h,
              ),
              regions(h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

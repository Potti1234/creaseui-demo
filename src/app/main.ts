import { Effect, Option, Schema as S } from "effect";
import { Command, Runtime, type Update } from "foldkit";
import type { Html, HtmlBuilder } from "foldkit/html";
import { defineMessageUnion } from "foldkit/message";
import * as Subscription from "foldkit/subscription";

import * as Sidebar from "@/ui/sidebar";
import * as Card from "@/ui/card";
import * as Table from "@/ui/table";
import * as Chart from "@/ui/chart";
import * as ToggleGroup from "@/ui/toggle-group";
import * as Dialog from "@/ui/dialog";
import * as Empty from "@/ui/empty";
import { alert, alertIcon, alertTitle } from "@/ui/alert";
import { badge } from "@/ui/badge";
import { button } from "@/ui/button";
import { grid } from "@/ui/grid";
import { heading } from "@/ui/heading";
import { input } from "@/ui/input";
import { progress } from "@/ui/progress";
import { separator } from "@/ui/separator";
import { hStack, vStack } from "@/ui/stack";
import { stat } from "@/ui/stat";
import { text } from "@/ui/text";
import {
  customers,
  filters,
  money,
  pages,
  ranges,
  series,
  type Customer,
  type Range,
  type Filter,
} from "./data";

const Model = S.Struct({
  sidebar: Sidebar.Model,
  rangeGroup: ToggleGroup.Model,
  filterGroup: ToggleGroup.Model,
  detail: Dialog.Model,
  page: S.Literals(pages),
  range: S.Literals(ranges),
  filter: S.Literals(filters),
  query: S.String,
  sort: S.Literals(["recent", "name", "mrr"]),
  ascending: S.Boolean,
  tablePage: S.Number,
  selectedId: S.Number,
  notice: S.String,
  chartError: S.String,
});
type Model = typeof Model.Type;
const Message = defineMessageUnion({
  Sidebar: { message: Sidebar.Message },
  Range: { message: ToggleGroup.Message },
  Filter: { message: ToggleGroup.Message },
  Dialog: { message: Dialog.Message },
  Chart: { message: Chart.ChartMessage },
  Navigate: { page: S.Literals(pages) },
  Search: { query: S.String },
  Sort: { field: S.Literals(["name", "mrr"]) },
  Page: { delta: S.Number },
  Open: { id: S.Number },
  Export: {},
  Exported: { count: S.Number },
  ExportFailed: {},
  Clear: {},
  MobileFocus: { backward: S.Boolean },
  Focused: {},
});
type Message = typeof Message.Type;
type H = HtmlBuilder<Message>;
const RangeGroup = ToggleGroup.create<Range>();
const FilterGroup = ToggleGroup.create<Filter>();
const pageSize = 6;
const projectCustomers = (model: Model): Customer[] =>
  customers
    .filter(
      (customer) =>
        (model.filter === "All" || customer.status === model.filter) &&
        [customer.name, customer.domain, customer.contact].some((value) =>
          value.toLowerCase().includes(model.query.trim().toLowerCase()),
        ),
    )
    .sort(
      (a, b) =>
        (model.ascending ? 1 : -1) *
        (model.sort === "mrr"
          ? a.mrr - b.mrr
          : model.sort === "name"
            ? a.name.localeCompare(b.name)
            : a.id - b.id),
    );

const Download = Command.define("DownloadCustomerReport", {
  args: {
    rows: S.Array(
      S.Struct({
        name: S.String,
        domain: S.String,
        plan: S.String,
        status: S.String,
        mrr: S.Number,
      }),
    ),
    range: S.String,
  },
  messages: [Message.Exported, Message.ExportFailed],
  execute: ({ rows, range }) =>
    Effect.try(() => {
      const csv = [
        "Company,Domain,Plan,Status,Monthly revenue (USD)",
        ...rows.map((row) =>
          [row.name, row.domain, row.plan, row.status, row.mrr].join(","),
        ),
      ].join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `northstar-customers-${range.toLowerCase()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      return Message.Exported({ count: rows.length });
    }).pipe(Effect.catch(() => Effect.succeed(Message.ExportFailed()))),
});

const FocusDrawer = Command.define("FocusMobileDrawer", {
  args: { action: S.Literals(["first", "next", "previous", "trigger"]) },
  messages: [Message.Focused],
  execute: ({ action }) =>
    Effect.promise(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    ).pipe(
      Effect.map(() => {
        if (action === "trigger") {
          Array.from(
            document.querySelectorAll<HTMLElement>(
              "[data-slot=sidebar-trigger]",
            ),
          )
            .find((node) => node.getClientRects().length > 0)
            ?.focus();
        } else {
          const panel = document.querySelector("[data-slot=sidebar-mobile]");
          const controls = Array.from(
            panel?.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]',
            ) ?? [],
          ).filter((node) => node.getClientRects().length > 0);
          const index = controls.findIndex(
            (node) => node === document.activeElement,
          );
          const next =
            action === "first"
              ? 0
              : (index + (action === "previous" ? -1 : 1) + controls.length) %
                controls.length;
          controls[next]?.focus();
        }
        return Message.Focused();
      }),
    ),
});

const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  keyboard: entry(
    { mobileOpen: S.Boolean, dialogOpen: S.Boolean },
    {
      modelToDependencies: (model) => ({
        mobileOpen: model.sidebar.isMobileOpen,
        dialogOpen: model.detail.isOpen,
      }),
      dependenciesToStream: ({ mobileOpen, dialogOpen }) =>
        Subscription.fromEventFilterMapPreventDefault<
          Document,
          "keydown",
          Message
        >({
          target: document,
          type: "keydown",
          filterMapEvent: (event) => {
            if (event.defaultPrevented) return Option.none();
            if (mobileOpen && !dialogOpen && event.key === "Escape")
              return Option.some(
                Message.Sidebar({
                  message: Sidebar.Message.SetMobileOpen({ isOpen: false }),
                }),
              );
            if (mobileOpen && !dialogOpen && event.key === "Tab")
              return Option.some(
                Message.MobileFocus({ backward: event.shiftKey }),
              );
            if (
              (event.ctrlKey || event.metaKey) &&
              event.key.toLowerCase() === "b"
            )
              return Option.some(
                Message.Sidebar({ message: Sidebar.Message.Toggled() }),
              );
            return Option.none();
          },
        }),
    },
  ),
}));

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case "Sidebar": {
      const r = Sidebar.update(model.sidebar, message.message);
      return {
        model: { ...model, sidebar: r.model },
        commands: [
          ...(r.commands ?? []).map((c) =>
            Command.mapMessage(c, (value) =>
              Message.Sidebar({ message: value }),
            ),
          ),
          ...(r.model.isMobileOpen !== model.sidebar.isMobileOpen
            ? [
                FocusDrawer({
                  action: r.model.isMobileOpen ? "first" : "trigger",
                }),
              ]
            : []),
        ],
      };
    }
    case "Range": {
      const r = RangeGroup.update(model.rangeGroup, message.message);
      const range =
        r.outMessage?._tag === "Selected" ? r.outMessage.value : model.range;
      return {
        model: { ...model, rangeGroup: r.model, range },
        commands: [
          ...(r.commands ?? []).map((c) =>
            Command.mapMessage(c, (value) => Message.Range({ message: value })),
          ),
          ...(range !== model.range
            ? [
                Command.mapMessage(
                  Chart.SyncChart({ hostId: "revenue", variant: range }),
                  (value) => Message.Chart({ message: value }),
                ),
              ]
            : []),
        ],
      };
    }
    case "Filter": {
      const r = FilterGroup.update(model.filterGroup, message.message);
      return {
        model: {
          ...model,
          filterGroup: r.model,
          filter:
            r.outMessage?._tag === "Selected"
              ? r.outMessage.value
              : model.filter,
          tablePage: 0,
        },
        commands: r.commands?.map((c) =>
          Command.mapMessage(c, (value) => Message.Filter({ message: value })),
        ),
      };
    }
    case "Dialog": {
      const r = Dialog.update(model.detail, message.message);
      return {
        model: { ...model, detail: r.model },
        commands: r.commands?.map((c) =>
          Command.mapMessage(c, (value) => Message.Dialog({ message: value })),
        ),
      };
    }
    case "Open": {
      const r = Dialog.open(model.detail);
      return {
        model: { ...model, selectedId: message.id, detail: r.model },
        commands: r.commands?.map((c) =>
          Command.mapMessage(c, (value) => Message.Dialog({ message: value })),
        ),
      };
    }
    case "Chart":
      return {
        model: {
          ...model,
          chartError:
            message.message._tag === "ChartMountFailed"
              ? message.message.reason
              : model.chartError,
        },
      };
    case "Navigate":
      return {
        model: {
          ...model,
          page: message.page,
          sidebar: { ...model.sidebar, isMobileOpen: false },
          notice: "",
        },
      };
    case "Search":
      return { model: { ...model, query: message.query, tablePage: 0 } };
    case "Sort":
      return {
        model: {
          ...model,
          sort: message.field,
          ascending:
            model.sort === message.field
              ? !model.ascending
              : message.field === "name",
          tablePage: 0,
        },
      };
    case "Page":
      return {
        model: {
          ...model,
          tablePage: Math.max(
            0,
            Math.min(
              Math.max(
                0,
                Math.ceil(projectCustomers(model).length / pageSize) - 1,
              ),
              model.tablePage + message.delta,
            ),
          ),
        },
      };
    case "Clear":
      return {
        model: { ...model, query: "", filter: "All", tablePage: 0, notice: "" },
      };
    case "Export":
      return {
        model,
        commands: [
          Download({ rows: projectCustomers(model), range: model.range }),
        ],
      };
    case "Exported":
      return {
        model: {
          ...model,
          notice: `Exported ${message.count} customer${message.count === 1 ? "" : "s"} to CSV.`,
        },
      };
    case "ExportFailed":
      return {
        model: {
          ...model,
          notice: "The download could not start. Please try again.",
        },
      };
    case "MobileFocus":
      return {
        model,
        commands: [
          FocusDrawer({ action: message.backward ? "previous" : "next" }),
        ],
      };
    case "Focused":
      return { model };
  }
};

Chart.registerChart("revenue", (theme, variant) => {
  const data = series[ranges.find((range) => range === variant) ?? "30D"];
  return {
    animationDuration: 350,
    textStyle: { fontFamily: theme.fontFamily },
    grid: {
      left: 2,
      right: 14,
      top: 20,
      bottom: 8,
      outerBoundsMode: "same",
      outerBoundsContain: "axisLabel",
    },
    tooltip: {
      ...Chart.tooltipOptions(theme),
      trigger: "axis",
      valueFormatter: (value) => money(Number(value)),
    },
    xAxis: Chart.categoryAxis(theme, data.labels, {
      axisLabel: { hideOverlap: true, margin: 16 },
    }),
    yAxis: {
      ...Chart.valueAxis(theme, {
        showLabels: true,
        axisLabel: { formatter: (value: number) => `$${value / 1000}k` },
      }),
      splitNumber: 4,
    },
    series: [
      {
        name: "Previous period",
        type: "line",
        data: data.previous,
        smooth: 0.3,
        symbol: "none",
        lineStyle: { color: theme.chart2, width: 2, type: "dashed" },
        itemStyle: { color: theme.chart2 },
      },
      {
        name: "Revenue",
        type: "line",
        data: data.current,
        smooth: 0.3,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: theme.chart1, width: 3 },
        itemStyle: { color: theme.chart1 },
        areaStyle: {
          color: Chart.areaGradient(theme.chart1, { from: 0.18, to: 0.01 }),
        },
      },
    ],
  };
});
const label = (value: string, h: H) =>
  text(
    {
      children: [value],
      color: "secondary",
      type: "supporting",
      hasTabularNumbers: true,
    },
    h,
  );
const metricGrid = (children: ReadonlyArray<Html>, h: H) =>
  grid(
    { columns: { minWidth: 210, max: 4, repeat: "fit" }, gap: 4, children },
    h,
  );

const navigation = (model: Model, h: H): Html =>
  Sidebar.sidebar(
    {
      state: model.sidebar.isOpen ? "expanded" : "collapsed",
      collapsible: "icon",
      isMobileOpen: model.sidebar.isMobileOpen,
      onMobileDismiss: Message.Sidebar({
        message: Sidebar.Message.SetMobileOpen({ isOpen: false }),
      }),
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
                              size: "lg",
                              tooltip: "Northstar workspace",
                              onClick: Message.Navigate({ page: "Overview" }),
                              iconName: "sparkles",
                              children: [
                                text(
                                  { type: "large", children: ["northstar"] },
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
                    Sidebar.sidebarGroupLabel({ children: ["WORKSPACE"] }, h),
                    Sidebar.sidebarMenu(
                      {
                        children: pages.map((page, index) =>
                          Sidebar.sidebarMenuItem(
                            {
                              children: [
                                Sidebar.sidebarMenuButton(
                                  {
                                    isActive: model.page === page,
                                    tooltip: page,
                                    onClick: Message.Navigate({ page }),
                                    iconName:
                                      index === 0
                                        ? "layout-dashboard"
                                        : index === 1
                                          ? "users"
                                          : "chart-bar-stacked",
                                    children: [page],
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
              ...(model.sidebar.isOpen
                ? [
                    Sidebar.sidebarGroup(
                      {
                        class: "mt-6",
                        children: [
                          Sidebar.sidebarGroupLabel(
                            { children: ["YOUR WORKSPACE"] },
                            h,
                          ),
                          vStack(
                            {
                              gap: 3,
                              padding: 3,
                              children: [
                                text(
                                  {
                                    type: "label",
                                    children: ["A clear view of growth."],
                                  },
                                  h,
                                ),
                                text(
                                  {
                                    type: "supporting",
                                    textWrap: "pretty",
                                    children: [
                                      "All your subscription metrics, in one place. Your next chapter starts here.",
                                    ],
                                  },
                                  h,
                                ),
                                badge(
                                  {
                                    variant: "secondary",
                                    children: ["Growth plan"],
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
                  ]
                : []),
            ],
          },
          h,
        ),
        Sidebar.sidebarFooter(
          {
            children: [
              Sidebar.sidebarSeparator({}, h),
              Sidebar.sidebarMenu(
                {
                  children: [
                    Sidebar.sidebarMenuItem(
                      {
                        children: [
                          Sidebar.sidebarMenuButton(
                            {
                              size: "lg",
                              tooltip: "Workspace information",
                              onClick: Message.Open({ id: 0 }),
                              iconName: "users",
                              children: [
                                vStack(
                                  {
                                    gap: 0,
                                    children: [
                                      text(
                                        {
                                          type: "label",
                                          children: ["Alex Morgan"],
                                        },
                                        h,
                                      ),
                                      label("Northstar workspace", h),
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
      ],
    },
    h,
  );

const metrics = (model: Model, h: H): Html =>
  metricGrid(
    [
      {
        label: "Total revenue",
        value: money(series[model.range].revenue),
        change: series[model.range].growth,
        description: `vs. previous ${model.range.replace("D", "")} days`,
      },
      {
        label: "Monthly recurring revenue",
        value: "$38,490",
        change: "12.8%",
        description: "+$4,368 from last month",
      },
      {
        label: "Active subscribers",
        value: "1,284",
        change: "8.2%",
        description: "+97 from last month",
      },
      {
        label: "Net revenue retention",
        value: "108.4%",
        change: "2.1%",
        description: "+2.2 pts from last month",
      },
    ].map((metric) =>
      Card.card(
        {
          size: "sm",
          children: [
            Card.cardContent(
              {
                children: [
                  stat(
                    {
                      ...metric,
                      size: "lg",
                      delta: { value: metric.change, direction: "up" },
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
    h,
  );

const revenueChart = (model: Model, h: H): Html =>
  Card.card(
    {
      class: "min-w-0 flex-1",
      children: [
        Card.cardHeader(
          {
            children: [
              Card.cardTitle(
                { element: "h2", children: ["Revenue overview"] },
                h,
              ),
              Card.cardDescription(
                { children: ["A little momentum, a bigger picture."] },
                h,
              ),
              Card.cardAction(
                {
                  children: [
                    badge({ variant: "outline", children: ["USD"] }, h),
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
              hStack(
                {
                  gap: 4,
                  align: "center",
                  children: [
                    text(
                      {
                        type: "display-3",
                        weight: "semibold",
                        hasTabularNumbers: true,
                        children: [money(series[model.range].revenue)],
                      },
                      h,
                    ),
                    badge(
                      {
                        variant: "secondary",
                        iconName: "arrow-up-right",
                        children: [`${series[model.range].growth} growth`],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Chart.eChart(
                {
                  hostId: "revenue",
                  variant: model.range,
                  dataSize: "dashboard",
                  ariaLabel: `Revenue and previous period, ${series[model.range].period}`,
                  toMessage: (message) => Message.Chart({ message }),
                  state: model.chartError ? "error" : "ready",
                  statusText: model.chartError || undefined,
                  accessibleAlternative: text(
                    {
                      as: "p",
                      children: series[model.range].labels.map(
                        (date, index) =>
                          `${date}: revenue ${money(series[model.range].current[index] ?? 0)}, previous period ${money(series[model.range].previous[index] ?? 0)}. `,
                      ),
                    },
                    h,
                  ),
                },
                h,
              ),
              Chart.chartLegend(
                {
                  config: {
                    current: { label: "Revenue", color: "var(--chart-1)" },
                    previous: {
                      label: "Previous period",
                      color: "var(--chart-2)",
                    },
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
  );

const planBreakdown = (h: H): Html =>
  Card.card(
    {
      class: "w-full xl:w-80 xl:shrink-0",
      children: [
        Card.cardHeader(
          {
            children: [
              Card.cardTitle(
                { element: "h2", children: ["Revenue by plan"] },
                h,
              ),
              Card.cardDescription(
                { children: ["Monthly recurring revenue"] },
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
                  type: "display-3",
                  weight: "semibold",
                  hasTabularNumbers: true,
                  children: ["$38,490"],
                },
                h,
              ),
              vStack(
                {
                  gap: 6,
                  paddingBlock: 4,
                  children: [
                    { name: "Scale", amount: 21554, share: 56 },
                    { name: "Growth", amount: 12317, share: 32 },
                    { name: "Starter", amount: 4619, share: 12 },
                  ].map((plan) =>
                    vStack(
                      {
                        gap: 2,
                        children: [
                          hStack(
                            {
                              justify: "between",
                              children: [
                                text(
                                  { type: "label", children: [plan.name] },
                                  h,
                                ),
                                text(
                                  {
                                    hasTabularNumbers: true,
                                    children: [money(plan.amount)],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          progress(
                            {
                              value: plan.share,
                              ariaLabel: `${plan.name}: ${plan.share}% of monthly revenue`,
                            },
                            h,
                          ),
                          label(`${plan.share}% of total revenue`, h),
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
        Card.cardFooter(
          { children: [label("Scale is your strongest revenue driver.", h)] },
          h,
        ),
      ],
    },
    h,
  );

const customerTable = (model: Model, h: H): Html => {
  const rows = projectCustomers(model);
  const start = model.tablePage * pageSize;
  const sortIcon = (field: "name" | "mrr") =>
    model.sort === field
      ? model.ascending
        ? "arrow-up"
        : "arrow-down"
      : "chevrons-up-down";
  return Card.card(
    {
      children: [
        Card.cardHeader(
          {
            children: [
              Card.cardTitle(
                {
                  element: "h2",
                  children: [
                    model.page === "Customers"
                      ? "All customers"
                      : "Recent customers",
                    " ",
                    badge(
                      {
                        variant: "secondary",
                        children: [String(customers.length)],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Card.cardDescription(
                { children: ["The people and teams growing with you."] },
                h,
              ),
              ...(model.page === "Overview"
                ? [
                    Card.cardAction(
                      {
                        children: [
                          button(
                            {
                              variant: "ghost",
                              size: "sm",
                              onClick: Message.Navigate({ page: "Customers" }),
                              trailingIconName: "arrow-up-right",
                              children: ["View all"],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ]
                : []),
            ],
          },
          h,
        ),
        Card.cardContent(
          {
            children: [
              hStack(
                {
                  gap: 3,
                  wrap: "wrap",
                  justify: "between",
                  align: "center",
                  children: [
                    FilterGroup.toggleGroup(
                      {
                        model: model.filterGroup,
                        toParentMessage: (message) =>
                          Message.Filter({ message }),
                        ariaLabel: "Filter customers by status",
                        value: model.filter,
                        size: "sm",
                        variant: "outline",
                        arrangement: "wrapped",
                        items: filters.map((value) => ({
                          value,
                          children: [value],
                        })),
                      },
                      h,
                    ),
                    vStack(
                      {
                        class: "w-full sm:w-64",
                        children: [
                          input(
                            {
                              id: "customer-search",
                              value: model.query,
                              role: "searchbox",
                              ariaLabel: "Search customers",
                              placeholder: "Search customers…",
                              onInput: (query) => Message.Search({ query }),
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
        Table.table(
          {
            ariaLabel: "Customers and monthly subscription revenue",
            children: [
              Table.tableHeader(
                {
                  children: [
                    Table.tableRow(
                      {
                        children: [
                          Table.tableHead(
                            {
                              sort:
                                model.sort === "name"
                                  ? model.ascending
                                    ? "ascending"
                                    : "descending"
                                  : "none",
                              children: [
                                button(
                                  {
                                    variant: "ghost",
                                    size: "sm",
                                    onClick: Message.Sort({ field: "name" }),
                                    trailingIconName: sortIcon("name"),
                                    children: ["Company"],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Table.tableHead({ children: ["Status"] }, h),
                          Table.tableHead({ children: ["Plan"] }, h),
                          Table.tableHead(
                            {
                              sort:
                                model.sort === "mrr"
                                  ? model.ascending
                                    ? "ascending"
                                    : "descending"
                                  : "none",
                              children: [
                                button(
                                  {
                                    variant: "ghost",
                                    size: "sm",
                                    onClick: Message.Sort({ field: "mrr" }),
                                    trailingIconName: sortIcon("mrr"),
                                    children: ["Monthly revenue"],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Table.tableHead({ children: ["Joined"] }, h),
                          Table.tableHead({ children: ["Details"] }, h),
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
                  children: rows
                    .slice(start, start + pageSize)
                    .map((customer) =>
                      Table.tableRow(
                        {
                          children: [
                            Table.tableCell(
                              {
                                children: [
                                  hStack(
                                    {
                                      gap: 3,
                                      align: "center",
                                      children: [
                                        badge(
                                          {
                                            variant: "outline",
                                            children: [
                                              customer.name
                                                .slice(0, 2)
                                                .toUpperCase(),
                                            ],
                                          },
                                          h,
                                        ),
                                        vStack(
                                          {
                                            gap: 0,
                                            children: [
                                              text(
                                                {
                                                  type: "label",
                                                  children: [customer.name],
                                                },
                                                h,
                                              ),
                                              label(customer.domain, h),
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
                                  badge(
                                    {
                                      variant:
                                        customer.status === "Active"
                                          ? "secondary"
                                          : customer.status === "Overdue"
                                            ? "destructive"
                                            : "outline",
                                      children: [customer.status],
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
                                  text({ children: [customer.plan] }, h),
                                ],
                              },
                              h,
                            ),
                            Table.tableCell(
                              {
                                children: [
                                  text(
                                    {
                                      hasTabularNumbers: true,
                                      children: [
                                        customer.mrr
                                          ? money(customer.mrr)
                                          : "—",
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
                                      color: "secondary",
                                      children: [customer.joined],
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
                                      variant: "ghost",
                                      size: "icon",
                                      ariaLabel: `View ${customer.name}`,
                                      onClick: Message.Open({
                                        id: customer.id,
                                      }),
                                      trailingIconName: "arrow-up-right",
                                      children: [],
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
              ),
            ],
          },
          h,
        ),
        ...(rows.length === 0
          ? [
              Empty.empty(
                {
                  children: [
                    Empty.emptyHeader(
                      {
                        children: [
                          Empty.emptyTitle(
                            { children: ["No matching customers"] },
                            h,
                          ),
                          Empty.emptyDescription(
                            {
                              children: [
                                "Try another company name, contact, or status.",
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    button(
                      {
                        variant: "outline",
                        onClick: Message.Clear(),
                        children: ["Clear filters"],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ]
          : []),
        Card.cardFooter(
          {
            children: [
              hStack(
                {
                  class: "w-full",
                  justify: "between",
                  align: "center",
                  gap: 3,
                  wrap: "wrap",
                  children: [
                    label(
                      rows.length
                        ? `Showing ${start + 1}–${Math.min(start + pageSize, rows.length)} of ${rows.length} customers`
                        : "0 customers",
                      h,
                    ),
                    hStack(
                      {
                        gap: 2,
                        children: [
                          button(
                            {
                              variant: "outline",
                              size: "sm",
                              isDisabled: start === 0,
                              onClick: Message.Page({ delta: -1 }),
                              leadingIconName: "chevron-left",
                              children: ["Previous"],
                            },
                            h,
                          ),
                          button(
                            {
                              variant: "outline",
                              size: "sm",
                              isDisabled: start + pageSize >= rows.length,
                              onClick: Message.Page({ delta: 1 }),
                              trailingIconName: "chevron-right",
                              children: ["Next"],
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
  );
};

const accountDialog = (model: Model, h: H): Html => {
  const customer = customers.find(
    (customer) => customer.id === model.selectedId,
  );
  return Dialog.dialog(
    {
      model: model.detail,
      toParentMessage: (message) => Message.Dialog({ message }),
      title: customer?.name ?? "Northstar workspace",
      description: customer?.domain ?? "Your business, in perspective.",
      content: () =>
        customer
          ? [
              grid(
                {
                  columns: { minWidth: 170, max: 2, repeat: "fit" },
                  gap: 6,
                  children: [
                    ["Account owner", customer.contact],
                    ["Subscription", `${customer.plan} plan`],
                    ["Monthly revenue", money(customer.mrr)],
                    ["Member since", customer.joined],
                  ].map(([name, value]) =>
                    vStack(
                      {
                        gap: 1,
                        children: [
                          label(name ?? "", h),
                          text({ type: "label", children: [value ?? ""] }, h),
                        ],
                      },
                      h,
                    ),
                  ),
                },
                h,
              ),
              separator({}, h),
              badge(
                {
                  variant:
                    customer.status === "Overdue" ? "destructive" : "secondary",
                  children: [customer.status],
                },
                h,
              ),
              text(
                {
                  as: "p",
                  type: "supporting",
                  children: [
                    customer.status === "Trial"
                      ? "This account is exploring Northstar. Revenue begins when the trial converts."
                      : customer.status === "Overdue"
                        ? "The latest invoice needs attention. This account remains included in committed MRR."
                        : "Subscription is active. The next invoice will be issued on November 1, 2026.",
                  ],
                },
                h,
              ),
            ]
          : [
              text(
                {
                  as: "p",
                  children: [
                    "A sample subscription business dashboard for Alex Morgan and the Northstar team. All figures are realistic demo data in USD, current to October 21, 2026.",
                  ],
                },
                h,
              ),
              text(
                {
                  as: "p",
                  color: "secondary",
                  children: [
                    "Revenue is collected revenue for the selected period. MRR, subscribers, retention, and plan mix are the current October snapshot. Search and CSV export cover the 12 sample customer accounts.",
                  ],
                },
                h,
              ),
            ],
      footer: () => [
        button(
          {
            variant: "outline",
            onClick: Message.Dialog({
              message: Dialog.Message.RequestedClose(),
            }),
            children: ["Done"],
          },
          h,
        ),
      ],
    },
    h,
  );
};

const view = (model: Model, h: H): Html =>
  Sidebar.sidebarProvider(
    {
      width: "15rem",
      state: model.sidebar.isOpen ? "expanded" : "collapsed",
      children: [
        navigation(model, h),
        Sidebar.sidebarInset(
          {
            class: "min-w-0",
            children: [
              hStack(
                {
                  as: "header",
                  paddingInline: 6,
                  paddingBlock: 4,
                  justify: "between",
                  align: "center",
                  children: [
                    hStack(
                      {
                        gap: 3,
                        align: "center",
                        children: [
                          Sidebar.sidebarTrigger(
                            {
                              onClick: Message.Sidebar({
                                message: Sidebar.Message.Toggled(),
                              }),
                              onMobileClick: Message.Sidebar({
                                message: Sidebar.Message.ToggledMobile(),
                              }),
                            },
                            h,
                          ),
                          text({ type: "label", children: ["Workspace"] }, h),
                          label("/", h),
                          label(model.page, h),
                        ],
                      },
                      h,
                    ),
                    badge(
                      {
                        variant: "outline",
                        iconName: "circle-check",
                        children: ["Live demo"],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              separator({}, h),
              vStack(
                {
                  as: "section",
                  gap: 6,
                  padding: 6,
                  class: "mx-auto w-full max-w-400",
                  children: [
                    hStack(
                      {
                        gap: 4,
                        wrap: "wrap",
                        justify: "between",
                        align: "center",
                        children: [
                          vStack(
                            {
                              gap: 1,
                              children: [
                                heading(
                                  {
                                    level: 1,
                                    textWrap: "balance",
                                    children: [
                                      model.page === "Overview"
                                        ? "Business overview"
                                        : model.page === "Customers"
                                          ? "Your customers"
                                          : "Revenue reports",
                                    ],
                                  },
                                  h,
                                ),
                                text(
                                  {
                                    color: "secondary",
                                    children: [
                                      model.page === "Customers"
                                        ? "Great relationships are good business."
                                        : "Welcome back, Alex. Here’s how things are looking.",
                                    ],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          button(
                            {
                              variant: "outline",
                              leadingIconName: "download",
                              onClick: Message.Export(),
                              children: ["Export customers"],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    ...(model.notice
                      ? [
                          alert(
                            {
                              announcement: "status",
                              severity: "success",
                              children: [
                                alertIcon({ children: [] }, h),
                                alertTitle({ children: [model.notice] }, h),
                              ],
                            },
                            h,
                          ),
                        ]
                      : []),
                    ...(model.page !== "Customers"
                      ? [
                          hStack(
                            {
                              gap: 3,
                              wrap: "wrap",
                              justify: "between",
                              align: "center",
                              children: [
                                label(series[model.range].period, h),
                                RangeGroup.toggleGroup(
                                  {
                                    model: model.rangeGroup,
                                    toParentMessage: (message) =>
                                      Message.Range({ message }),
                                    ariaLabel: "Revenue period",
                                    value: model.range,
                                    variant: "outline",
                                    size: "sm",
                                    items: ranges.map((value) => ({
                                      value,
                                      ariaLabel: `Last ${value.replace("D", "")} days`,
                                      children: [value],
                                    })),
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          metrics(model, h),
                          hStack(
                            {
                              collapseBelow: "xl",
                              gap: 6,
                              align: "stretch",
                              children: [
                                revenueChart(model, h),
                                planBreakdown(h),
                              ],
                            },
                            h,
                          ),
                        ]
                      : []),
                    ...(model.page !== "Reports"
                      ? [customerTable(model, h)]
                      : [
                          Card.card(
                            {
                              children: [
                                Card.cardHeader(
                                  {
                                    children: [
                                      Card.cardTitle(
                                        {
                                          element: "h2",
                                          children: ["About your metrics"],
                                        },
                                        h,
                                      ),
                                      Card.cardDescription(
                                        {
                                          children: [
                                            "The context behind the numbers.",
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
                                          as: "p",
                                          children: [
                                            "Revenue compares collected subscription revenue with the immediately preceding period of equal length. Hover over the chart to inspect each interval.",
                                          ],
                                        },
                                        h,
                                      ),
                                      text(
                                        {
                                          as: "p",
                                          color: "secondary",
                                          children: [
                                            "MRR and plan revenue reflect the October 21 snapshot. Net revenue retention measures expansion, contraction and churn among existing customers; 108.4% means those customers are spending more than they did last month.",
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
                        ]),
                    hStack(
                      {
                        as: "footer",
                        gap: 2,
                        wrap: "wrap",
                        justify: "between",
                        children: [
                          label("Made for the bigger picture.", h),
                          label("Sample data · Updated Oct 21, 2026", h),
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
        accountDialog(model, h),
      ],
    },
    h,
  );

export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: (): { model: Model } => ({
        model: {
          sidebar: Sidebar.init(),
          rangeGroup: {
            id: "range",
            maybeFocusedIndex: Option.none(),
            activationMode: "Manual",
          },
          filterGroup: {
            id: "customer-filter",
            maybeFocusedIndex: Option.none(),
            activationMode: "Manual",
          },
          detail: Dialog.init({ id: "customer-detail", isAnimated: true }),
          page: "Overview",
          range: "30D",
          filter: "All",
          query: "",
          sort: "recent",
          ascending: true,
          tablePage: 0,
          selectedId: 0,
          notice: "",
          chartError: "",
        },
      }),
      update,
      view,
      subscriptions,
      container: document.getElementById("root"),
      devTools: false,
    }),
  );

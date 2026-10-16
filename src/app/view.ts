import type { Html, HtmlBuilder } from 'foldkit/html'

import { Message, type Model, type Todo } from './main'

const todoRow = (todo: Todo, h: HtmlBuilder<Message>): Html =>
  h.li(
    [h.Class('flex items-center gap-3 border-b border-gray-200 py-2')],
    [
      h.input([
        h.Type('checkbox'),
        h.Id(`todo-${todo.id}`),
        h.Checked(todo.isDone),
        h.OnChange(() => Message.ToggledTodo({ id: todo.id })),
      ]),
      h.label(
        [
          h.For(`todo-${todo.id}`),
          h.Class(todo.isDone ? 'flex-1 text-gray-400 line-through' : 'flex-1'),
        ],
        [todo.title],
      ),
      h.button(
        [
          h.Type('button'),
          h.Class('rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50'),
          h.OnClick(Message.RemovedTodo({ id: todo.id })),
        ],
        ['Remove'],
      ),
    ],
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.main(
    [h.Class('mx-auto max-w-lg p-8 font-sans')],
    [
      h.h1([h.Class('mb-4 text-2xl font-bold')], ['Todos']),
      h.form(
        [h.Class('mb-4 flex gap-2'), h.OnSubmit(Message.SubmittedDraft())],
        [
          h.input([
            h.Type('text'),
            h.Class('flex-1 rounded border border-gray-300 px-3 py-2'),
            h.Placeholder('What needs doing?'),
            h.AriaLabel('New todo'),
            h.Value(model.draft),
            h.OnInput(value => Message.ChangedDraft({ value })),
          ]),
          h.button(
            [
              h.Type('submit'),
              h.Class('rounded bg-blue-600 px-4 py-2 font-medium text-white'),
            ],
            ['Add'],
          ),
        ],
      ),
      h.ul([], model.todos.map(todo => todoRow(todo, h))),
      h.p(
        [h.Class('mt-4 text-sm text-gray-500')],
        [`${model.todos.filter(todo => !todo.isDone).length} left`],
      ),
    ],
  )

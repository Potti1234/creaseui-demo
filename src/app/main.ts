import { Match as M, Schema as S } from 'effect'
import { Runtime, type Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { view } from './view'

// MODEL

export const Todo = S.Struct({ id: S.Number, title: S.String, isDone: S.Boolean })
export type Todo = typeof Todo.Type

export const Model = S.Struct({
  draft: S.String,
  nextId: S.Number,
  todos: S.Array(Todo),
})
export type Model = typeof Model.Type

// MESSAGE

export const Message = defineMessageUnion({
  ChangedDraft: { value: S.String },
  SubmittedDraft: {},
  ToggledTodo: { id: S.Number },
  RemovedTodo: { id: S.Number },
})
export type Message = typeof Message.Type

// UPDATE

type UpdateReturn = Update.Return<Model, Message>

const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ChangedDraft: ({ value }) => ({ model: { ...model, draft: value } }),
      SubmittedDraft: () =>
        model.draft.trim() === ''
          ? { model }
          : {
              model: {
                draft: '',
                nextId: model.nextId + 1,
                todos: [
                  ...model.todos,
                  { id: model.nextId, title: model.draft.trim(), isDone: false },
                ],
              },
            },
      ToggledTodo: ({ id }) => ({
        model: {
          ...model,
          todos: model.todos.map(todo =>
            todo.id === id ? { ...todo, isDone: !todo.isDone } : todo,
          ),
        },
      }),
      RemovedTodo: ({ id }) => ({
        model: { ...model, todos: model.todos.filter(todo => todo.id !== id) },
      }),
    }),
  )

const init = (): Model => ({
  draft: '',
  nextId: 3,
  todos: [
    { id: 1, title: 'Write the release notes', isDone: true },
    { id: 2, title: 'Review the dashboard PR', isDone: false },
  ],
})


export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: init() }),
      update,
      view,
      container: document.getElementById('root'),
      devTools: false,
    }),
  )

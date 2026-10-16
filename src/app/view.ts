import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'
import { card, cardContent, cardFooter, cardHeader, cardTitle } from '@/ui/card'
import { checkbox } from '@/ui/checkbox'
import { form } from '@/ui/form'
import { input } from '@/ui/input'
import { list, listItem } from '@/ui/list'
import { section } from '@/ui/section'
import { stack } from '@/ui/stack'
import { text } from '@/ui/text'

import { Message, type Model, type Todo } from './main'

const todoRow = (todo: Todo, h: HtmlBuilder<Message>): Html =>
  listItem(
    {
      label: checkbox(
        {
          id: `todo-${todo.id}`,
          label: todo.title,
          isChecked: todo.isDone,
          onToggle: () => Message.ToggledTodo({ id: todo.id }),
        },
        h,
      ),
      endContent: button(
        {
          children: ['Remove'],
          variant: 'ghost',
          size: 'sm',
          ariaLabel: `Remove ${todo.title}`,
          onClick: Message.RemovedTodo({ id: todo.id }),
        },
        h,
      ),
    },
    h,
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  section(
    {
      variant: 'transparent',
      padding: 8,
      maxWidth: '32rem',
      class: 'mx-auto',
      children: [
        card(
          {
            children: [
              cardHeader({ children: [cardTitle({ children: ['Todos'] }, h)] }, h),
              cardContent(
                {
                  children: [
                    stack(
                      {
                        gap: 4,
                        children: [
                          form(
                            {
                              ariaLabel: 'Add a todo',
                              onSubmit: Message.SubmittedDraft(),
                              children: [
                                stack(
                                  {
                                    direction: 'horizontal',
                                    gap: 2,
                                    children: [
                                      input(
                                        {
                                          id: 'new-todo',
                                          ariaLabel: 'New todo',
                                          placeholder: 'What needs doing?',
                                          value: model.draft,
                                          onInput: value => Message.ChangedDraft({ value }),
                                          class: 'flex-1',
                                        },
                                        h,
                                      ),
                                      button({ children: ['Add'], type: 'submit' }, h),
                                    ],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          list(
                            { hasDividers: true, children: model.todos.map(todo => todoRow(todo, h)) },
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
              cardFooter(
                {
                  children: [
                    text(
                      {
                        color: 'secondary',
                        size: 'sm',
                        children: [`${model.todos.filter(todo => !todo.isDone).length} left`],
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

// expect: no-restricted-imports
// Issues are created by the composer only (D8).
import * as Dialog from '@/ui/dialog'

export const quickCreate = Dialog.init({ id: 'quick-create' })

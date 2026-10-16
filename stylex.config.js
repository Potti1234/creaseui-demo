import { fileURLToPath } from 'node:url'

export const stylexCompilerOptions = Object.freeze({
  aliases: Object.freeze({
    '@/*': Object.freeze([fileURLToPath(new URL('./src/*', import.meta.url))]),
  }),
  styleResolution: 'property-specificity',
  sxPropName: false,
  useCSSLayers: Object.freeze({
    before: Object.freeze(['base']),
    after: Object.freeze(['utilities']),
    prefix: 'stylex',
  }),
})

export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          'cssnano': {
            preset: [
              'advanced',
              {
                discardComments: {
                  removeAll: true,
                },
                reduceIdents: false,
                zindex: false,
                colormin: {
                  preserve: true,
                },
                normalizeWhitespace: false,
              },
            ],
          },
          '@fullhuman/postcss-purgecss': {
            content: [
              './src/pages/**/*.{js,jsx,ts,tsx}',
              './src/components/**/*.{js,jsx,ts,tsx}',
              './src/app/**/*.{js,jsx,ts,tsx}',
            ],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
              standard: [
                /^glass/,
                /^text-gradient/,
                /^surface/,
                /^animate/,
                /^modal/,
                /^artist/,
                /^genre/,
                /^filter/,
                /^related/,
                /^connection/,
              ],
              deep: [
                /glass$/,
                /gradient$/,
                /surface$/,
                /animate$/,
                /modal$/,
                /artist$/,
                /genre$/,
                /filter$/,
                /related$/,
                /connection$/,
              ],
              greedy: [
                /glass/,
                /gradient/,
                /surface/,
                /animate/,
                /modal/,
                /artist/,
                /genre/,
                /filter/,
                /related/,
                /connection/,
              ],
            },
          },
        }
      : {}),
  },
}

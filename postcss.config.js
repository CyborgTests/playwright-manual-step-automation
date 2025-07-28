import prefixer from 'postcss-prefix-selector';

export default {
  plugins: [
    prefixer({
      prefix: '#cyborg-app',
      transform(prefix, selector, prefixedSelector) {
        if (
          selector.startsWith('html') ||
          selector.startsWith('body') ||
          selector.startsWith(':root')
        ) {
          return selector;
        }

        return prefixedSelector;
      },
    }),
  ],
};
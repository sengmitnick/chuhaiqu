module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['nativewind/babel', { mode: 'compileOnly' }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/utils': './utils',
            '@/components': './components',
            '@/services': './services',
            '@/contexts': './contexts',
            '@/config': './config',
            '@/types': './types',
            '@/hooks': './hooks',
          },
        },
      ],
    ],
  };
};

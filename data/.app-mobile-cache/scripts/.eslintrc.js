module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  globals: {
    __dirname: 'readonly',
    __filename: 'readonly',
    module: 'readonly',
    require: 'readonly',
    exports: 'readonly',
    process: 'readonly',
    console: 'readonly',
    Buffer: 'readonly',
    global: 'readonly',
  },
}; 
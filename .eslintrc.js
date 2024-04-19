module.exports = {
  env: {
    browser: true,
    es6: true,
    mocha: true
  },
  extends: [
    'airbnb-base',
    'plugin:import/typescript'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  settings: {
    "import/resolver": {
      typescript: {} // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'fp', 
    'security'
  ],
  rules: {
    "import/extensions": ["off", "never" | "always" | "ignorePackages"], 
    "max-len": ["off", "never" | "always" | "ignorePackages"],
    "import/prefer-default-export":  ["off", "never" | "always" | "ignorePackages"],
    "no-unused-vars": ["off", "never" | "always" | "ignorePackages"],

    "indent": ["error", 4],
     // embrace functional programming
     "no-var": "error",
     "fp/no-class": "error",
     "fp/no-delete": "error",
     "fp/no-events": "error",
     "fp/no-let": "error",
     "fp/no-loops": "error",
     "fp/no-mutating-assign": "error",
     "fp/no-mutation": ['error', {
         exceptions: [{
             object: 'module',
             property: 'exports',

         }]
     }],
     "fp/no-nil": "error",
     //"fp/no-proxy": "error",
     "fp/no-this": "error",
     "fp/no-throw": "error",
     //"fp/no-unused-expression": "error",
  },
};

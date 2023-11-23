module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': 'google',
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    'jsdoc',
  ],
  'rules': {
    'max-len': [0, 160, 2, {ignoreUrls: true}],
    'new-cap': 0,
    'camelcase': 0,
    'no-unused-vars': 0,
  },
};

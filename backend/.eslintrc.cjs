module.exports = {
  env: { node: true, es2021: true },
  extends: ['airbnb-base'],
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'import/prefer-default-export': 'off',
    'no-param-reassign': ['error', { props: false }],
  }
}

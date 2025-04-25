const Configuration = {
  extends: [`@commitlint/config-conventional`],
  ignores: [
    (/** @type {string | string[]} */ message) => message.includes(`Release`),
  ],
  rules: {
    'type-enum': [
      2,
      `always`,
      [
        `feat`,
        `fix`,
        `docs`,
        `style`,
        `refactor`,
        `perf`,
        `tests`,
        `chore`,
        `revert`,
        `database`,
      ],
    ],
  },
}

module.exports = Configuration

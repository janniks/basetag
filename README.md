# at-base ⚾️
`at-base` _(pronounced `@ base`)_ lets you require local packages relative your NodeJS applications base path.

```
npm i -S at-base
```

## Why? What does `at-base` solve? ⚡️

In NodeJS applications we sometimes want to require local packages that are in different subdirectories.
This can lead to very messy looking `require` statements.
`at-base` allows you to require packages using `@` as the applications base path.
If you're not convinced—check out the example below...

😓 _The traditional (often messy) way:_

```js
const balls = require('../../../../baseball/balls')
```

🤯 _The_ `at-base` _way:_

```js
const balls = require('@/baseball/balls')
```

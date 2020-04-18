# at-base ⚾️
`at-base` _(pronounced `@ base`)_ lets you require local packages relative to your NodeJS applications base path.

## Installation 🛠

`npm i -S at-base`

☝️ and that's it!
You're can use `at-base`.
No need to `require('at-base')` anywhere.

## Why? ⚡️

**What does `at-base` solve?**

In NodeJS applications we sometimes want to import local packages that are in different far away subdirectories.
This can lead to very messy looking `require` statements.
`at-base` allows you to import packages using `@` as the applications base path.
If you're not convinced—check out the example below...

😓 _The traditional (often messy) way:_

```js
const balls = require('../../../../baseball/balls') // ❌
```

🤯 _The modern_ `at-base` _way:_

```js
const balls = require('@/baseball/balls')           // ✅
```

## How? 💭

It's rather simple.
After installing `at-base` as a dependency our `postinstall` script creates a symlink that points from `node_modules/@` to your projects base directory.
Everytime you use a `require` with `@/…` NodeJS will look inside the `@` package (i.e. our new symlink).
The lookup is routed natively to your projects files.

To NodeJS, both methods of requiring look the same, because the files are literally the same files.
We can use both methods in the same project and NodeJS will cache imports correctly.

## License ⚖️

[MIT](LICENSE)

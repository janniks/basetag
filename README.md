# ⚾️ basetag
`basetag` lets you require local modules relative to your NodeJS applications base path.

## Installation 🛠

`npm i -S basetag`

☝️ and that's it!
You can use `basetag`.
No need to `require('basetag')` anywhere.

## Why? ⚡️

**What does `basetag` solve?**

In NodeJS applications we sometimes want to import local modules that are in different far away subdirectories.
This can lead to very messy looking `require` statements.
`basetag` allows you to import modules using `$/` as the applications base path.
If you're not convinced—check out the example below...

🤯 _The modern_ `basetag` _way:_

```js
const balls = require('$/baseball/balls')           // ✅
```

😓 _The traditional (often messy) way:_

```js
const balls = require('../../../../baseball/balls') // ❌
```

## How? 💭

### How do I use `basetag`?

It's really all described above and there's not much to it.
Look at the code in `test/example/` for a real-life example.

A larger project can have many nested subfolders as shown in the directory structure below.
Of course a _real_ project would have more files in those subdirectories but for simplicity we'll leave those out.
Using `basetag` you can reference modules from the base `example/` path, rather than using relative directories (i.e. `../../..`).

```
example/
├── its/
│   └── baseballs/
│       └── all/
│           └── the/
│               └── way/
│                   └── down.js
├── somewhere/
│   └── deep/
│       └── and/
│           └── random.js
└── index.js
```

### How does `basetag` work?

It's rather simple.
After installing `basetag` as a dependency a `postinstall` script creates a symlink that points from `node_modules/$` to your projects base directory.
Everytime you use a `require` with `$/…` NodeJS will look inside the `$` package (i.e. our new symlink).
The lookup is routed natively to your projects files.

To NodeJS, both methods of requiring look the same, because the files are literally the same files.
We can use both methods in the same project and NodeJS will cache imports correctly.

## License ⚖️

[MIT](LICENSE)

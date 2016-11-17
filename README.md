# tap-reporter-spec

Formatted TAP output like Mocha's spec reporter

**NOTE**

Originaly forked from the excellent [tap-spec](https://github.com/scottcorgan/tap-spec) by [scottcorgan](https://github.com/scottcorgan),
but the [tap-out](https://github.com/scottcorgan/tap-out) parser doesn't work properly with in-script streams,
so I switched the TAP parser to [tap-parser](https://github.com/tapjs/tap-parser)

** Example **
![iterm - 2 bash - may 29 2015 at 10 17 am screen shot](https://cloud.githubusercontent.com/assets/974723/7888261/03366236-05ec-11e5-9f94-d9c2707526b7.png)

## Install

```
npm install tap-spec --save-dev
```

## Usage

### Streaming

```js
var test = require('tape');
var tapSpec = require('tap-spec');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);
```

### CLI

**package.json**

```json
{
  "name": "module-name",
  "scripts": {
    "test": "node ./test/tap-test.js | tap-spec"
  }
}
```

Then run with `npm test`

**Terminal**

```
tape test/index.js | node_modules/.bin/tap-spec
```

**Testling**

```
npm install testling -g
testling test/index.js | node_modules/.bin/tap-spec
```

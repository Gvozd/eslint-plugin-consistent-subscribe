# eslint-plugin-consistent-subscribe

[![Build Status][travis-image]][travis-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![dependencies][deps-image]][deps-url]
[![devDependencies][dev-deps-image]][dev-deps-url]
[![peerDependencies][peer-deps-image]][peer-deps-url]

[![Downloads graph][downloads-graph-image]][downloads-url]

> ESLint rule, checking pairing subscriptions


## Installation

You'll first need to install [ESLint](http://eslint.org):
```bash
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-consistent-subscribe`:
```bash
$ npm install eslint-plugin-consistent-subscribe --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-consistent-subscribe` globally.

## Usage

Add `consistent-subscribe` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:
```json
{
    "plugins": [
        "consistent-subscribe"
    ]
}
```

Then configure the rules you want to use under the rules section.
```json
{
    "rules": {
        "consistent-subscribe/consistent-subscribe": 2
    }
}
```

## Supported Rules
### consistent-subscribe

#### Rule Details
This rule aims to...\
Examples of **incorrect** code for this rule:
```js
$('body').on('click', onClick);
// subscribe, without unsubscribe
```
Examples of **correct** code for this rule:
```js
$('body').on('click', onClick);
setTimeout(() => {
  $('body').off('click', onClick);
}, 1000);
```

#### Options
This rule takes a list of objects, where each object describes a separate API subscription.\
Default value is:
```js
/* eslint-enable consistent-subscribe/consistent-subscribe: [2, {open: 'addEventListener', close: 'removeEventListener'}, {open: 'on',close: 'off'}, {open: 'subscribe',close: 'unsubscribe'}] */
```
* **open** name of subscribe method, i.e. on/subscribe/addEventListener
* **close** name of unsubscribe method, i.e. off/unsubscribe/removeEventListener
* **contextEquality**. default *true* - need check, that listened object strict equal
    The following patterns are not warnings:
    ```js
    /* eslint-enable consistent-subscribe/consistent-subscribe: [2, {open: 'on',close: 'off', contextEquality: false}] */
    $('body').on('click', onClick);
    $(document.body).off('click', onClick);
    ```
* **openArgumentsEquality**/**closeArgumentsEquality**. default *true* - arguments should strict equal\
If need check not all arguments, this is array of indexed arguments for check\

    The following patterns are considered warnings:
    ```js
    /* eslint-enable consistent-subscribe/consistent-subscribe: [2, {open: 'on',close: 'off', openArgumentsEquality: true, closeArgumentsEquality: true}] */
    $('body').on('click', onClick);
    $('body').off('click');//missing handler argument
    ```
  
    The following patterns are not warnings:
    ```js
    /* eslint-enable consistent-subscribe/consistent-subscribe: [2, {open: 'on',close: 'off', openArgumentsEquality: [0], closeArgumentsEquality: [0]}] */
    $('body').on('click', onClick);
    $('body').off('click');//missing handler argument, but it's OK, because checked only first argument
    ```


## Author

© 2016 Viktor Gvozdev <gvozdev.viktor@gmail.com> and [contributors][].

## License

Released under the [MIT license](https://opensource.org/licenses/MIT).



[travis-url]: https://travis-ci.org/Gvozd/eslint-plugin-consistent-subscribe
[travis-image]: https://img.shields.io/travis/Gvozd/eslint-plugin-consistent-subscribe.svg
[npm-url]: https://www.npmjs.com/package/eslint-plugin-consistent-subscribe
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-consistent-subscribe.svg
[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/eslint-plugin-consistent-subscribe.svg
[deps-url]: https://david-dm.org/Gvozd/eslint-plugin-consistent-subscribe
[deps-image]: https://david-dm.org/Gvozd/eslint-plugin-consistent-subscribe.png
[dev-deps-url]: https://david-dm.org/Gvozd/eslint-plugin-consistent-subscribe?type=dev
[dev-deps-image]: https://david-dm.org/Gvozd/eslint-plugin-consistent-subscribe/dev-status.png
[peer-deps-url]: https://david-dm.org/Gvozd/eslint-plugin-consistent-subscribe?type=peer
[peer-deps-image]: https://david-dm.org/Gvozd/eslint-plugin-consistent-subscribe/peer-status.png
[downloads-url]: https://www.npmjs.com/package/eslint-plugin-consistent-subscribe
[downloads-image]: https://img.shields.io/npm/dm/eslint-plugin-consistent-subscribe.svg?style=flat
[downloads-graph-image]: https://nodei.co/npm-dl/eslint-plugin-consistent-subscribe.png?months=1
[npm-shield-image]: https://nodei.co/npm/eslint-plugin-consistent-subscribe.png

[contributors]: https://github.com/Gvozd/eslint-plugin-consistent-subscribe/graphs/contributors

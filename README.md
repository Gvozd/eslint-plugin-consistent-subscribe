# eslint-plugin-consistent-subscribe

[![Build Status][travis-image]][travis-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license-url]

[travis-url]: https://travis-ci.org/Gvozd/eslint-plugin-consistent-subscribe
[travis-image]: https://img.shields.io/Gvozd/eslint-plugin-consistent-subscribe.svg
[npm-url]: https://www.npmjs.com/package/eslint-plugin-consistent-subscribe
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-consistent-subscribe.svg
[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/eslint-plugin-consistent-subscribe.svg


> ESLint rule, checking pairing subscriptions

## Usage

1. Install `eslint-plugin-consistent-subscribe` as a dev-dependency:

    ```shell
    npm install --save-dev eslint-plugin-consistent-subscribe
    ```

2. Enable the plugin by adding it to your `.eslintrc`:

    ```yaml
    plugins:
      - consistent-subscribe
    ```

### Rules
consistent-subscribe
**open** name of subscribe method, i.e. on/subscribe/addEventListener
**close** name of unsubscribe method, i.e. off/unsubscribe/removeEventListener
**contextEquality** default *true* - need check, that object strict equal
 ```js
 // failed, when contextEquality=true
 $('body').on('click', onClick);
 $(document.body).off('click', onClick);
 ```
**openArgumentsEquality**/**closeArgumentsEquality** default *true* - arguments should strict equal
If need check not all arguments, this is array of indexed arguments for check
 ```js
 // failed, when openArgumentsEquality=true, closeArgumentsEquality=true
 $('body').on('click', onClick);
 $('body').off('click');//missing handler argument
 ```
 ```js
 // success, when openArgumentsEquality=[0], closeArgumentsEquality=[0]
 $('body').on('click', onClick);
 $('body').off('click');//missing handler argument, but it's OK
 ```


## Author

© 2016 Viktor Gvozdev <gvozdev.viktor@gmail.com> and [contributors][].

[contributors]: https://github.com/Gvozd/eslint-plugin-consistent-subscribe/graphs/contributors

## License

Released under the **MIT license**.

Released under the [MIT license](https://opensource.org/licenses/MIT).

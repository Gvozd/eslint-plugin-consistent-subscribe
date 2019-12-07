'use strict';

const rule = require('../../lib/rules/consistent-subscribe');
const RuleTester = require('eslint').RuleTester;
const ruleTester = new RuleTester();

ruleTester.run('consistent-subscribe', rule, {
    valid: [
        `
            function onClick() {}
            document.addEventListener('click', onClick);
            document.removeEventListener('click', onClick);
        `,
        `
            function onClick() {}
            $('body').on('click', onClick);
            $('body' )
                .off('click',onClick);
        `,
        `
            foo.start();
        `,
        {
            code: `
                foo.start();
                foo.stop();
            `,
            options: [{open: 'start', close: 'stop'}]
        },
        {
            code: `
                foo.start();
                bar.stop();
            `,
            options: [{open: 'start', close: 'stop', contextEquality: false}]
        },
        {
            code: `
                foo.start(bar, baz);
                foo.stop(quux, quuux);
            `,
            options: [{open: 'start', close: 'stop', openArgumentsEquality: [], closeArgumentsEquality: []}]
        },
        {
            code: `
                foo.start(bar, baz);
                foo.stop(bar, quux);
            `,
            options: [{open: 'start', close: 'stop', openArgumentsEquality: [0], closeArgumentsEquality: [0]}]
        },
        {
            code: `
                foo.start(bar, baz);
                foo.stop(quux, bar);
            `,
            options: [{open: 'start', close: 'stop', openArgumentsEquality: [0], closeArgumentsEquality: [-1]}]
        },
        // fixed crashes
        `
            (function() {})();
        `,
        `
            foo.bar()();
        `,
        `
            foo.toString()
        `,
        {
            code: `
                (() => {})()
            `,
            parserOptions: {ecmaVersion: 6}
        },
        {
            code: `
                (async () => {})()
            `,
            parserOptions: {ecmaVersion: 8}
        },
        `
            (foo || bar)()
        `
    ],
    invalid: [
        {
            code: `
                function onClick() {}
                document.addEventListener('click', onClick);
            `,
            errors: [{message: 'unpaired "addEventListener"', type: 'CallExpression'}]
        },
        {
            code: `
                foo.start();
            `,
            options: [{open: 'start', close: 'stop'}],
            errors: [{message: 'unpaired "start"', type: 'CallExpression'}]
        },
        {
            code: `
                foo.start();
                bar.stop();
            `,
            options: [{open: 'start', close: 'stop', contextEquality: true}],
            errors: [{message: 'unpaired "start"'}]
        },
        {
            code: `
                foo.start(bar, baz);
                foo.stop(quux);
            `,
            options: [{open: 'start', close: 'stop', openArgumentsEquality: true, closeArgumentsEquality: true}],
            errors: [{message: 'unpaired "start"'}]
        },
        {
            code: '// deprecated options',
            options: [[{open: 'start', close: 'stop'}]],
            errors: [{
                message: 'Deprecated options format. Not need additional wrap to array. ' +
                    'Use `\'consistent-subscribe/consistent-subscribe\': [2, {"open":"start","close":"stop"}]`'
            }]
        }
    ]
});

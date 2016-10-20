'use strict';

const rule = require('../lib/consistent-subscribe');
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
            $('body').off('click', onClick);
        `,
        `
            foo.start();
        `,
        {
            code: `
                foo.start();
                foo.stop();
            `,
            options: [[{open: 'start', close: 'stop'}]]
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
            options: [[{open: 'start', close: 'stop'}]],
            errors: [{message: 'unpaired "start"', type: 'CallExpression'}]
        }
    ]
});

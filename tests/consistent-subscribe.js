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
            errors: [{message: 'unpaired addEventListener', type: 'CallExpression'}]
        }
    ]
});

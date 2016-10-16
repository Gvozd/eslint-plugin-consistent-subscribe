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
        `
    ],
    invalid: [
        {
            code: `
                function onClick() {}
                document.addEventListener('click', onClick);
            `,
            errors: [{message: 'unpaired addEventListener', type: 'CallExpression'}]
        },
    ]
});

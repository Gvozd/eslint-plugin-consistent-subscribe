/**
 * @fileoverview Rule to check paired unsubscribe
 * @author Gvozd
 */
'use strict';

const defaultOptions = [
    {
        open: 'addEventListener',
        close: 'removeEventListener'
    },
    {
        open: 'on',
        close: 'off'
    },
    {
        open: 'subscribe',
        close: 'unsubscribe'
    }
];

module.exports = {
    meta: {
        docs: {
            description: 'check paired unsubscribe',
            category: 'Possible Errors',
            recommended: false
        },
        schema: [
            {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        open: {
                            type: 'string'
                        },
                        close: {
                            type: 'string'
                        }
                    },
                    required: ['open', 'close'],
                    additionalProperties: false
                }
            }
        ]
    },
    create(context) {
        const options = processOptions(context.options[0] || defaultOptions);
        const sourceCode = context.getSourceCode();
        const callExpressions = [];
        return {
            'CallExpression'(node) {
                const callee = node.callee;
                let methodName;
                switch (callee.type) {
                    case 'MemberExpression':
                        methodName = callee.property.name;
                        break;
                    case 'Identifier':
                        methodName = callee.name;
                        break;
                    case 'FunctionExpression':
                    case 'CallExpression':
                        break;
                    default:
                        throw new Error('unknown callee type: ' + callee.type);
                }
                callExpressions.push({
                    node,
                    methodName,
                    fullSource: sourceCode.getTokens(node)
                        .map((x) => x.value).join('')
                });
            },
            'Program:exit'() {
                for (const callExpression of callExpressions) {
                    if (!options.hasOwnProperty(callExpression.methodName)) {
                        continue;
                    }
                    if (!hasPair(callExpression, callExpressions, options)) {
                        context.report({
                            node: callExpression.node,
                            message: `unpaired "${callExpression.methodName}"`
                        });
                    }
                }
            }
        };
    }
};

function processOptions(options) {
    const pairs = {};
    for (const option of options) {
        pairs[option.open] = {
            open: option.open,
            close: option.close
        };
    }
    return pairs;
}

function hasPair(callExpression, callExpressions, options) {
    const closeName = options[callExpression.methodName].close;
    return callExpressions
        .some(
            (x) => x.methodName === closeName &&
                x.fullSource.split(closeName).join(callExpression.methodName) === callExpression.fullSource
        );
}

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
        const pairs = processOptions(context.options[0] || defaultOptions);
        const sourceCode = context.getSourceCode();
        const callExpressions = [];
        return {
            'CallExpression'(node) {
                const callee = node.callee;
                let functionName;
                switch (callee.type) {
                    case 'MemberExpression':
                        functionName = callee.property.name;
                        break;
                    case 'Identifier':
                        functionName = callee.name;
                        break;
                    case 'FunctionExpression':
                    case 'CallExpression':
                        break;
                    default:
                        throw new Error('unknown callee type: ' + callee.type);
                }
                callExpressions.push({
                    node,
                    functionName,
                    source: sourceCode.getTokens(node)
                        .map((x) => x.value).join('')
                });
            },
            'Program:exit'() {
                for (const data of callExpressions) {
                    if (pairs.hasOwnProperty(data.functionName)) {
                        const closeName = pairs[data.functionName];
                        const hasCloseCall = callExpressions
                            .some(
                                (x) => x.functionName === closeName &&
                                x.source.split(closeName).join(data.functionName) === data.source
                            );
                        if (!hasCloseCall) {
                            context.report({
                                node: data.node,
                                message: `unpaired "${data.functionName}"`
                            });
                        }
                    }
                }
            }
        };
    }
};

function processOptions(options) {
    const pairs = {};
    for (const pair of options) {
        pairs[pair.open] = pair.close;
    }
    return pairs;
}

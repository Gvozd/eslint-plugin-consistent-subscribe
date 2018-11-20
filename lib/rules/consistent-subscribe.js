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
                        open: {type: 'string'},
                        close: {type: 'string'},
                        contextEquality: {
                            type: 'boolean',
                            default: true
                        },
                        openArgumentsEquality: {
                            anyOf: [
                                {enum: [true]},
                                {
                                    type: 'array',
                                    items: {type: 'number'}
                                }
                            ],
                            default: true
                        },
                        closeArgumentsEquality: {
                            anyOf: [
                                {enum: [true]},
                                {
                                    type: 'array',
                                    items: {type: 'number'}
                                }
                            ],
                            default: true
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
                const callArgs = node.arguments;
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
                    case 'ArrowFunctionExpression':
                        break;
                    default:
                        throw new Error('unknown callee type: ' + callee.type);
                }
                callExpressions.push({
                    node,
                    methodName,
                    contextSource: sourceCode.getTokens(callee)
                        .map((x) => x.value).join(''),
                    argumentsSources: callArgs.map(
                        (arg) => sourceCode.getTokens(arg)
                            .map((x) => x.value).join('')
                    )
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
            close: option.close,
            contextEquality: 'contextEquality' in option ? option.contextEquality : true,
            openArgumentsEquality: ('openArgumentsEquality' in option) ? option.openArgumentsEquality : true,
            closeArgumentsEquality: ('closeArgumentsEquality' in option) ? option.closeArgumentsEquality : true
        };
    }
    return pairs;
}

function hasPair(openCall, callExpressions, options) {
    const option = options[openCall.methodName];
    const closeName = option.close;
    return callExpressions.some(isCloseCall);

    function isCloseCall(closeCall) {
        if (closeCall.methodName !== closeName) {
            return false;
        }
        if (option.contextEquality) {
            if (closeCall.contextSource.split(closeName).join(openCall.methodName) !== openCall.contextSource) {
                return false;
            }
        }
        const openArgs = sliceByMask(openCall.argumentsSources, option.openArgumentsEquality);
        const closeArgs = sliceByMask(closeCall.argumentsSources, option.closeArgumentsEquality);
        return closeArgs.join() === openArgs.join();
    }
}

function sliceByMask(array, mask) {
    if (mask === true) {
        return array;
    }
    return mask.map((idx) => {
        if (idx < 0) {
            idx = array.length + idx;
        }
        return array[idx];
    });
}

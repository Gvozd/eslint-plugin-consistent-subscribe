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

const optionSchema = {
    type: 'object',
    properties: {
        open: {type: 'string'},
        close: {type: 'string'},
        contextEquality: {
            type: 'boolean'
            // default: true // TODO uncomment after remove deprecated options format
        },
        openArgumentsEquality: {
            anyOf: [
                {enum: [true]},
                {
                    type: 'array',
                    items: {type: 'number'}
                }
            ]
            // default: true // TODO uncomment after remove deprecated options format
        },
        closeArgumentsEquality: {
            anyOf: [
                {enum: [true]},
                {
                    type: 'array',
                    items: {type: 'number'}
                }
            ]
            // default: true // TODO uncomment after remove deprecated options format
        }
    },
    required: ['open', 'close'],
    additionalProperties: false
};

module.exports = {
    meta: {
        docs: {
            description: 'check paired unsubscribe',
            category: 'Possible Errors',
            recommended: false
        },
        schema: {
            oneOf: [
                {
                    type: 'array',
                    minItems: 0,
                    items: optionSchema
                },
                {// TODO remove deprecated options format
                    type: 'array',
                    minItems: 1,
                    maxItems: 1,
                    items: {
                        type: 'array',
                        minItems: 1,
                        items: optionSchema
                    }
                }
            ]
        }
    },
    create(context) {
        const passedOptions = context.options.length ?
            (context.options[0].length ? deprecateOptions(context.options[0], context) : context.options) :
            undefined;
        const options = processOptions(passedOptions || defaultOptions);
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
                    case 'Super':
                        methodName = 'super';
                        break;
                    case 'FunctionExpression':
                    case 'CallExpression':
                    case 'ArrowFunctionExpression':
                    case 'LogicalExpression':
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

function deprecateOptions(opts, context) {
    const sourceCode = context.getSourceCode();
    context.report(
        sourceCode.ast,
        [
            'Deprecated options format. Not need additional wrap to array.',
            `Use \`'consistent-subscribe/consistent-subscribe': [2, ${JSON.stringify(opts).slice(1, -1)}]\``
        ].join(' ')
    );
    return opts;
}

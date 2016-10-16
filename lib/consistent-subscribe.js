/**
 * @fileoverview Rule to check paired unsubscribe
 * @author Gvozd
 */
'use strict';

const estraverse = require('estraverse');
const escodegen = require('escodegen');

const pairsSettings = [
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
const pairs = {};
for (const pair of pairsSettings) {
    pairs[pair.open] = pair.close;
}

module.exports = {
    meta: {
        docs: {
            description: 'check paired unsubscribe',
            category: 'Possible Errors',
            recommended: false
        },
        schema: []
    },
    create: function (context) {
        var callExpressions = [];
        estraverse.traverse(context.getSourceCode().ast, {
            enter(node, parent) {
                node.parent = parent;
                if (node.type === 'CallExpression') {
                    collectCallExpression.call(callExpressions, node);
                }
            }
        });
        for (const data of callExpressions) {
            if (pairs.hasOwnProperty(data.functionName)) {
                const closeName = pairs[data.functionName];
                const hasCloseCall = callExpressions
                    .some(
                        x => x.functionName === closeName &&
                        x.source.split(closeName).join(data.functionName) === data.source
                    );
                if (!hasCloseCall) {
                    context.report({
                        node: data.node,
                        message: `unpaired ${data.functionName}`
                    });
                }
            }
        }
        return {};
    }
};

function collectCallExpression(node) {
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
    this.push({//eslint-disable-line no-invalid-this
        node,
        functionName,
        source: escodegen.generate(node)
    });
}

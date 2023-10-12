module.exports = function (babel) {
    const { types: t } = babel;

    return {
        name: "transform-unclosed-img-tags",
        visitor: {
            JSXOpeningElement(path) {
                if (path.node.name.name === 'img' && !path.get('selfClosing').node) {
                    path.node.selfClosing = true;
                }
            }
        }
    };
};

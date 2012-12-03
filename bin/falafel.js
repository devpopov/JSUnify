(function() {

var parse = typeof(window)=='undefined' ? require('esprima').parse : window.esprima.parse;
var falafel = function (src, opts, fn, breathFirstFn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
		breathFirstFn = fn;
    }
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src || opts.source;
    opts.range = true;
    if (typeof src !== 'string') { src = String(src); }
	if (typeof breathFirstFn === 'undefined') { breathFirstFn = function(){}; }

    var ast = parse(src, opts);

    var result = {
        chunks : src.split(''),
        toString : function () { return result.chunks.join(''); },
        inspect : function () { return result.toString(); }
    };
    var index = 0;

    (function walk (node, parent) {
        insertHelpers(node, parent, result.chunks);
        breathFirstFn(node);

        Object.keys(node).forEach(function (key) {
            if (key === 'parent') { return; }

            var child = node[key];
            if (Array.isArray(child)) {
                child.forEach(function (c) {
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                });
            }
            else if (child && typeof child.type === 'string') {
                insertHelpers(child, node, result.chunks);
                breathFirstFn(child);
                walk(child, node);
            }
        });
        fn(node);
    })(ast, undefined);

    return result;
};
 
function insertHelpers (node, parent, chunks) {
    if (!node.range) return;
    
    node.parent = parent;
    
    node.source = function () {
        return chunks.slice(
            node.range[0], node.range[1]
        ).join('');
    };
    
    if (node.update && typeof node.update === 'object') {
        var prev = node.update;
        Object.keys(prev).forEach(function (key) {
            update[key] = prev[key];
        });
        node.update = update;
    }
    else {
        node.update = update;
    }
    
    function update (s) {
        chunks[node.range[0]] = s;
        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
            chunks[i] = '';
        }
    };
}

//export
if(typeof(window)=='undefined') { module.exports = falafel; }
else { window.falafel = falafel; }

})();
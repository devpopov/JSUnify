runtests=()->
    for prop of JSUnify
        window[prop] = JSUnify[prop]
        
    module "parse"
    test "simple parse Tin.node test", ()->
        res = parse([{a: [1,{},"r"]}])[0].node
        deepEqual(res, [[new Box("a"),[new Box(1),[new DictFlag()],new Box("r")]],new DictFlag()])
        
    module "unify"
    test "simple black box unify test", () ->
        ok(unify([{a: [1,2,3]}, {a: [1,new Var("b"),3]}]))
    test "variable equal [X,2,X] -> [1,2,1]", () ->
        tins = unify([[new Var("x"), 2, new Var("x")], [1,2,1]])
        ok(tins)
        deepEqual(tins[0].get_all(), {"x":1})
    test "variable unequal [1,3,2] -> [Y,Y,2]", () ->
        tins = unify([ [1, 3, 2], [new Var("y"), new Var("y"), 2] ])
        ok(tins == null) # Unification should fail
        log tins[1].get_all()
    test "three part unify [X,1,2] -> [Y,1,2] -> [1,1,X]", () ->
        tins = unify([[new Var("x"),1,2],[new Var("y"),1,2],[1,1,new Var("x")]])
        ok(tins,"unification succeeded?")
        ok(tins[0].get("x") == 1, "t1.x == 1?")
        ok(tins[1].get("y") == 1, "t2.y == 1?")
        ok(tins[2].get("x") == 2, "t3.x == 2?")
    module "extract"
    test "simple variable extraction test", () ->
        tins = unify([{a: [1,2,3]}, {a: [1,new Var("b"),3]}])
        ok(tins[1].get("b") == 2)
    test "extract all variables test", () ->
        tins = unify([{a: [1,2,3]}, {a: [1,new Var("b"),3]}])
        deepEqual(tins[1].get_all(), {"b":2})


# utils
log=(o)->console.log o
dir=(o)->console.dir o
len=(o)-> o.length
str=(o)->
    if typeof o == "undefined"
        "undefined"
    else if o==null
        "null"
    else
        o.toString()
extern=(name, o)->window[name] = o
extern "runtests", runtests
extern "str", str
extern "len", len
extern "log", log
extern "dir", dir

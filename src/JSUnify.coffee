# utils
str=(o)->o.toString()
String.prototype.format = (args...)->
	@replace(new RegExp("{(\d+)}", "g"), (match, number) -> if typeof args[number] != 'undefined' then args[number] else match )
String.prototype.repeat = (num)->new Array(num + 1).join(this)

# type testing functions
isbool=(o) -> typeof o == "boolean"
isarray=(o) -> o? && Array.isArray o
isstr=(o) -> typeof o == "string"
isnum=(o) -> typeof o == "number"
isobj=(o) -> typeof o == "object"
isvaluetype=(o) -> isbool(o) or isstr(o) or isnum(o)

# metadata to indicate this was a dictionary
WAS_DICT = "WAS_DICT"

class Box
    constructor: (v) -> 
        if isvaluetype(v) 
            @value = v
        else
            throw "Can only box value types"
    toString: () -> "Box({0})".format(@value)

class Var
    constructor: (@name) ->

boxit = (elem) -> 
    if isarray elem  
        return (boxit(item) for item in elem)
    else if isobj elem
        a = []
        for key of elem
            a.push( [boxit(key), boxit(elem[key])] )
        a.push(WAS_DICT)
        return a.sort()
    else if isvaluetype elem
        return new Box elem
    else
        throw "Don't understand the type of elem"

b2s = (boxed) -> 
    

console.log(boxit( {a:[1,2,3]}  ))

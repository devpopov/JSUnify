(function() {
  var Frame, FunctionCondition, Program, Rule, backtrack, extern, name, unify,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  unify = typeof module === 'undefined' ? window.unify : require('unify');

  if (typeof module === 'undefined') {
    window.JSUnify = {};
  }

  extern = function(name, o) {
    if (typeof module === 'undefined') {
      return window.JSUnify[name] = o;
    } else {
      return module.exports[name] = o;
    }
  };

  for (name in unify) {
    extern(name, unify[name]);
  }

  Program = (function() {

    function Program() {
      this.rules = [];
      this.settings = {
        debug: false
      };
    }

    Program.prototype.query = function() {
      var goal, goals, success;
      goals = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      goals = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = goals.length; _i < _len; _i++) {
          goal = goals[_i];
          _results.push(unify.box(goal));
        }
        return _results;
      })();
      success = false;
      backtrack(this.rules, [new Frame(goals.slice(0))], this.settings.debug ? function(parms, resume) {
        switch (parms.name) {
          case "match":
          case "success":
            console.log("" + parms.depth + " " + parms.name + ": " + (parms.rule !== null ? unify.toJson(parms.rule.tin.unbox()) : void 0));
            break;
          default:
            console.log("" + parms.depth + " " + parms.name + ": " + (unify.toJson(parms.goal.unbox())));
        }
        if (parms.name === "success") {
          return success = true;
        } else if (resume !== null) {
          return resume();
        }
      } : function(parms, resume) {
        if (parms.name === "success") {
          return success = true;
        } else if (resume !== null) {
          return resume();
        }
      });
      if (!success) {
        return null;
      } else if (goals.length === 1) {
        return goals[0];
      } else {
        return goals;
      }
    };

    Program.prototype.queryAsync = function(goals, callback) {
      var goal, newCallback;
      newCallback = callback;
      if (callback === null) {
        newCallback = (function(parms, resume) {
          if (resume !== null && parms.name !== "success") {
            return resume();
          }
        });
      } else if (!this.settings.debug) {
        newCallback = function(parms, resume) {
          if (parms.name === "done") {
            return callback(parms, resume);
          } else if (resume !== null) {
            return resume();
          }
        };
      }
      goals = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = goals.length; _i < _len; _i++) {
          goal = goals[_i];
          _results.push(unify.box(goal));
        }
        return _results;
      })();
      backtrack(this.rules, [new Frame(goals.slice(0))], newCallback);
      return goals;
    };

    Program.prototype.rule = function() {
      var conditions, fact;
      fact = arguments[0], conditions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.rules.push((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Rule, [fact].concat(__slice.call(conditions)), function(){}));
      return this;
    };

    Program.prototype.iff = function(conditional) {
      var rule;
      if (this.rules.length === 0) {
        throw "iff is invalid in this context. A rule must be created first!";
      }
      rule = this.rules[this.rules.length - 1];
      rule.iff(conditional);
      return this;
    };

    Program.prototype.load = function(rules) {
      var rule, _i, _len;
      for (_i = 0, _len = rules.length; _i < _len; _i++) {
        rule = rules[_i];
        this.rules.push(rule);
      }
      return this;
    };

    return Program;

  })();

  Rule = (function() {

    function Rule() {
      var c, conditions, fact, _i, _len;
      fact = arguments[0], conditions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.clone = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Rule, [fact].concat(__slice.call(conditions)), function(){});
      };
      this.fact = fact;
      this.tin = unify.box(fact);
      this.conditions = [];
      for (_i = 0, _len = conditions.length; _i < _len; _i++) {
        c = conditions[_i];
        this.iff(c);
      }
    }

    Rule.prototype.iff = function(condition) {
      var mergedVarlist, varKey, varValue, _ref, _ref1;
      if (unify.types.isFunc(condition)) {
        condition = new FunctionCondition(condition);
      } else {
        condition = unify.box(condition);
      }
      if (this.conditions.length === 0) {
        mergedVarlist = {};
        _ref = this.tin.varlist;
        for (varKey in _ref) {
          varValue = _ref[varKey];
          mergedVarlist[varKey] = varValue;
        }
      } else {
        mergedVarlist = this.conditions[0].varlist;
      }
      _ref1 = condition.varlist;
      for (varKey in _ref1) {
        varValue = _ref1[varKey];
        if (mergedVarlist[varKey] === void 0) {
          mergedVarlist[varKey] = varValue;
        }
      }
      condition.varlist = mergedVarlist;
      this.conditions.push(condition);
      return this;
    };

    return Rule;

  })();

  FunctionCondition = (function(_super) {

    __extends(FunctionCondition, _super);

    function FunctionCondition(func) {
      this.func = func;
      FunctionCondition.__super__.constructor.call(this, null, null, {});
    }

    FunctionCondition.prototype.toString = function() {
      return this.func.toString().replace(/(\r\n|\n|\r)/gm, "");
    };

    FunctionCondition.prototype.unbox = function() {
      return this.toString();
    };

    return FunctionCondition;

  })(unify.TreeTin);

  Frame = (function() {

    function Frame(subgoals) {
      this.subgoals = subgoals;
      this.subgoals = this.subgoals.slice(0);
      this.goal = this.subgoals.shift();
      this.ruleIndex = 0;
      this.satisfyingRule = null;
    }

    return Frame;

  })();

  backtrack = function(rules, frameStack, callback) {
    var frame, goal, success;
    frame = frameStack[frameStack.length - 1];
    goal = frame.goal;
    success = false;
    frame.satisfyingRule = null;
    if (frame.ruleIndex === 0) {
      callback({
        "name": "try",
        "goal": goal,
        "depth": frameStack.length
      }, null);
    } else {
      goal.rollback();
      callback({
        "name": "retry",
        "goal": goal,
        "depth": frameStack.length
      }, null);
    }
    if (goal instanceof FunctionCondition) {
      if (frame.ruleIndex === 0 && goal.func(goal)) {
        success = true;
        frame.ruleIndex++;
      }
    } else {
      while (frame.ruleIndex < rules.length) {
        if (goal.unify(rules[frame.ruleIndex].tin)) {
          success = true;
          frame.satisfyingRule = rules[frame.ruleIndex];
          rules[frame.ruleIndex] = frame.satisfyingRule.clone();
          frame.ruleIndex++;
          break;
        }
        frame.ruleIndex++;
      }
    }
    if (!success) {
      frameStack.pop();
      if (frameStack.length === 0) {
        callback({
          "name": "done",
          "goal": goal,
          "depth": frameStack.length
        }, null);
      } else {
        callback({
          "name": "fail",
          "goal": goal,
          "depth": frameStack.length
        }, function() {
          return backtrack(rules, frameStack, callback);
        });
      }
    } else if (frame.satisfyingRule !== null && frame.satisfyingRule.conditions.length !== 0) {
      frameStack.push(new Frame(frame.satisfyingRule.conditions.concat(frame.subgoals)));
      callback({
        "name": "match",
        "goal": goal,
        "subgoals": frame.subgoals,
        "rule": frame.satisfyingRule,
        "depth": frameStack.length
      }, function() {
        return backtrack(rules, frameStack, callback);
      });
    } else if (frame.subgoals.length === 0) {
      callback({
        "name": "success",
        "goal": goal,
        "rule": frame.satisfyingRule,
        "depth": frameStack.length
      }, function() {
        return backtrack(rules, frameStack, callback);
      });
    } else {
      frameStack.push(new Frame(frame.subgoals));
      callback({
        "name": "match",
        "goal": goal,
        "subgoals": null,
        "rule": frame.satisfyingRule,
        "depth": frameStack.length
      }, function() {
        return backtrack(rules, frameStack, callback);
      });
    }
  };

  extern("Rule", Rule);

  extern("Program", Program);

}).call(this);

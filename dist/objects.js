var urlHelper = require("url");
var ExecutionItem = /** @class */ (function () {
    function ExecutionItem() {
        this.newItem = function () { return ({
            endStamp: 0,
            id: uniqid(),
            httpStatusCode: 0,
            startStamp: Date.now(),
            totalDuration: 0,
        }); };
        this.item = this.newItem();
        return this;
    }
    ;
    ExecutionItem.prototype.end = function () {
        this.item.endStamp = Date.now();
        this.item.totalDuration = this.item.endStamp - this.item.startStamp;
        return this.item;
    };
    return ExecutionItem;
}());
var ExecutionState = /** @class */ (function () {
    function ExecutionState() {
        this.newState = function () { return ({
            averageDuration: 0,
            currentDuration: 0,
            endStamp: 0,
            errors: 0,
            executions: [],
            requestWaiting: false,
            startStamp: 0,
            success: 0,
        }); };
        this.state = this.newState();
        return this;
    }
    ExecutionState.prototype.averageDuration = function () {
        if (this.state.executions.length === 0)
            return 0;
        return this.state.executions.reduce(function (total, _a) {
            var totalDuration = _a.totalDuration;
            return total + totalDuration;
        }, 0) / this.state.executions.length;
    };
    ExecutionState.prototype.start = function () {
        this.state.startStamp = Date.now();
        this.state.requestWaiting;
        return this;
    };
    ExecutionState.prototype.isRequestInProgress = function () {
        return this.state.requestWaiting;
    };
    ExecutionState.prototype.end = function () {
        this.state.requestWaiting = false;
        this.state.endStamp = Date.now();
        this.state.averageDuration = this.averageDuration();
        return this.state;
    };
    ;
    return ExecutionState;
}());
var Execution = /** @class */ (function () {
    function Execution(url, options) {
        this.options = options;
        this.status = new ExecutionState();
        return this;
    }
    Execution.prototype.start = function () {
        return this;
    };
    Execution.prototype.end = function () {
        return this.status.end();
    };
    ;
    return Execution;
}());

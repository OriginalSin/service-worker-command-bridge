import { Action } from "./interfaces";
import deepForEach from "deep-for-each";
var CommandBridgeListener = /** @class */ (function () {
    function CommandBridgeListener() {
        this.boundFunctions = {};
    }
    CommandBridgeListener.prototype.processMessage = function (e) {
        if (!e.data || !e.data.action || e.data.action !== Action.RunCommand) {
            return;
        }
        var command = e.data.command;
        var respondOn = e.data.respondOn;
        var listener = this.boundFunctions[command.name];
        if (!listener) {
            return;
        }
        Promise.resolve(listener(command.data))
            .then(function (returnData) {
            return { data: returnData };
        })
            .catch(function (error) {
            return { error: error };
        })
            .then(function (response) {
            var transferables = [];
            deepForEach(response, function (value) {
                if (value instanceof MessagePort ||
                    value instanceof ArrayBuffer) {
                    transferables.push(value);
                }
            });
            respondOn.postMessage(response, transferables);
        });
    };
    CommandBridgeListener.prototype.bind = function (name, listener) {
        if (this.boundFunctions[name]) {
            throw new Error("Command is already bound to " + name);
        }
        this.boundFunctions[name] = listener;
    };
    CommandBridgeListener.prototype.listen = function () {
        self.addEventListener("message", this.processMessage.bind(this));
    };
    return CommandBridgeListener;
}());
export { CommandBridgeListener };
export var CommandListener = new CommandBridgeListener();
//# sourceMappingURL=worker.js.map
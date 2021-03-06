var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2008, 2013 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.Object = (function () {
    function Object() {
        _classCallCheck(this, Object);
    }

    _createClass(Object, [{
        key: "addEventListener",

        // Public

        value: function addEventListener() {
            return WebInspector.Object.addEventListener.apply(this, arguments);
        }
    }, {
        key: "singleFireEventListener",
        value: function singleFireEventListener() {
            return WebInspector.Object.singleFireEventListener.apply(this, arguments);
        }
    }, {
        key: "removeEventListener",
        value: function removeEventListener() {
            return WebInspector.Object.removeEventListener.apply(this, arguments);
        }
    }, {
        key: "removeAllListeners",
        value: function removeAllListeners() {
            return WebInspector.Object.removeAllListeners.apply(this, arguments);
        }
    }, {
        key: "hasEventListeners",
        value: function hasEventListeners() {
            return WebInspector.Object.hasEventListeners.apply(this, arguments);
        }
    }, {
        key: "retainedObjectsWithPrototype",
        value: function retainedObjectsWithPrototype() {
            return WebInspector.Object.retainedObjectsWithPrototype.apply(this, arguments);
        }
    }, {
        key: "dispatchEventToListeners",
        value: function dispatchEventToListeners(eventType, eventData) {
            var event = new WebInspector.Event(this, eventType, eventData);

            function dispatch(object) {
                if (!object || !object._listeners || !object._listeners[eventType] || event._stoppedPropagation) return;

                // Make a copy with slice so mutations during the loop doesn't affect us.
                var listenersForThisEvent = object._listeners[eventType].slice(0);

                // Iterate over the listeners and call them. Stop if stopPropagation is called.
                for (var i = 0; i < listenersForThisEvent.length; ++i) {
                    listenersForThisEvent[i].listener.call(listenersForThisEvent[i].thisObject, event);
                    if (event._stoppedPropagation) break;
                }
            }

            // Dispatch to listeners of this specific object.
            dispatch(this);

            // Allow propagation again so listeners on the constructor always have a crack at the event.
            event._stoppedPropagation = false;

            // Dispatch to listeners on all constructors up the prototype chain, including the immediate constructor.
            var constructor = this.constructor;
            while (constructor) {
                dispatch(constructor);

                if (!constructor.prototype.__proto__) break;

                constructor = constructor.prototype.__proto__.constructor;
            }

            return event.defaultPrevented;
        }
    }], [{
        key: "addEventListener",

        // Static

        value: function addEventListener(eventType, listener, thisObject) {
            thisObject = thisObject || null;

            console.assert(eventType, "Object.addEventListener: invalid event type ", eventType, "(listener: ", listener, "thisObject: ", thisObject, ")");
            if (!eventType) return;

            console.assert(listener, "Object.addEventListener: invalid listener ", listener, "(event type: ", eventType, "thisObject: ", thisObject, ")");
            if (!listener) return;

            if (!this._listeners) this._listeners = {};

            var listeners = this._listeners[eventType];
            if (!listeners) listeners = this._listeners[eventType] = [];

            // Prevent registering multiple times.
            for (var i = 0; i < listeners.length; ++i) {
                if (listeners[i].listener === listener && listeners[i].thisObject === thisObject) return;
            }

            listeners.push({ thisObject: thisObject, listener: listener });
        }
    }, {
        key: "singleFireEventListener",
        value: function singleFireEventListener(eventType, listener, thisObject) {
            var _this = this,
                _arguments = arguments;

            var wrappedCallback = function wrappedCallback() {
                _this.removeEventListener(eventType, wrappedCallback, null);
                listener.apply(thisObject, _arguments);
            };

            this.addEventListener(eventType, wrappedCallback, null);
            return wrappedCallback;
        }
    }, {
        key: "removeEventListener",
        value: function removeEventListener(eventType, listener, thisObject) {
            eventType = eventType || null;
            listener = listener || null;
            thisObject = thisObject || null;

            if (!this._listeners) return;

            if (!eventType) {
                for (eventType in this._listeners) this.removeEventListener(eventType, listener, thisObject);
                return;
            }

            var listeners = this._listeners[eventType];
            if (!listeners) return;

            for (var i = listeners.length - 1; i >= 0; --i) {
                if (listener && listeners[i].listener === listener && listeners[i].thisObject === thisObject) listeners.splice(i, 1);else if (!listener && thisObject && listeners[i].thisObject === thisObject) listeners.splice(i, 1);
            }

            if (!listeners.length) delete this._listeners[eventType];

            if (!window.Object.keys(this._listeners).length) delete this._listeners;
        }
    }, {
        key: "removeAllListeners",
        value: function removeAllListeners() {
            delete this._listeners;
        }
    }, {
        key: "hasEventListeners",
        value: function hasEventListeners(eventType) {
            if (!this._listeners || !this._listeners[eventType]) return false;
            return true;
        }

        // This should only be used within regression tests to detect leaks.
    }, {
        key: "retainedObjectsWithPrototype",
        value: function retainedObjectsWithPrototype(proto) {
            var results = new Set();
            for (var eventType in this._listeners) {
                var recordsForEvent = this._listeners[eventType];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = recordsForEvent[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var listener = _step.value;

                        if (listener.thisObject instanceof proto) results.add(listener.thisObject);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"]) {
                            _iterator["return"]();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            return results;
        }
    }]);

    return Object;
})();

WebInspector.Event = (function () {
    function Event(target, type, data) {
        _classCallCheck(this, Event);

        this.target = target;
        this.type = type;
        this.data = data;
        this.defaultPrevented = false;
        this._stoppedPropagation = false;
    }

    _createClass(Event, [{
        key: "stopPropagation",
        value: function stopPropagation() {
            this._stoppedPropagation = true;
        }
    }, {
        key: "preventDefault",
        value: function preventDefault() {
            this.defaultPrevented = true;
        }
    }]);

    return Event;
})();

WebInspector.notifications = new WebInspector.Object();

WebInspector.Notification = {
    GlobalModifierKeysDidChange: "global-modifiers-did-change",
    PageArchiveStarted: "page-archive-started",
    PageArchiveEnded: "page-archive-ended",
    ExtraDomainsActivated: "extra-domains-activated"
};

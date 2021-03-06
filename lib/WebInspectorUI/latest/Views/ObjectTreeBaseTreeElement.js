var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.ObjectTreeBaseTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(ObjectTreeBaseTreeElement, _WebInspector$GeneralTreeElement);

    function ObjectTreeBaseTreeElement(representedObject, propertyPath, property) {
        _classCallCheck(this, ObjectTreeBaseTreeElement);

        console.assert(representedObject);
        console.assert(propertyPath instanceof WebInspector.PropertyPath);
        console.assert(!property || property instanceof WebInspector.PropertyDescriptor);

        _get(Object.getPrototypeOf(ObjectTreeBaseTreeElement.prototype), "constructor", this).call(this, null, null, null, representedObject, false);

        this._property = property;
        this._propertyPath = propertyPath;

        this.small = true;
        this.toggleOnClick = true;
        this.selectable = false;
        this.tooltipHandledSeparately = true;
    }

    // Public

    _createClass(ObjectTreeBaseTreeElement, [{
        key: "oncontextmenu",

        // Protected

        value: function oncontextmenu(event) {
            this._contextMenuHandler(event);
        }
    }, {
        key: "resolvedValue",
        value: function resolvedValue() {
            console.assert(this._property);
            if (this._getterValue) return this._getterValue;
            if (this._property.hasValue()) return this._property.value;
            return null;
        }
    }, {
        key: "resolvedValuePropertyPath",
        value: function resolvedValuePropertyPath() {
            console.assert(this._property);
            if (this._getterValue) return this._propertyPath.appendPropertyDescriptor(this._getterValue, this._property, WebInspector.PropertyPath.Type.Value);
            if (this._property.hasValue()) return this._propertyPath.appendPropertyDescriptor(this._property.value, this._property, WebInspector.PropertyPath.Type.Value);
            return null;
        }
    }, {
        key: "thisPropertyPath",
        value: function thisPropertyPath() {
            console.assert(this._property);
            return this._propertyPath.appendPropertyDescriptor(null, this._property, this.propertyPathType());
        }
    }, {
        key: "hadError",
        value: function hadError() {
            console.assert(this._property);
            return this._property.wasThrown || this._getterHadError;
        }
    }, {
        key: "propertyPathType",
        value: function propertyPathType() {
            console.assert(this._property);
            if (this._getterValue || this._property.hasValue()) return WebInspector.PropertyPath.Type.Value;
            if (this._property.hasGetter()) return WebInspector.PropertyPath.Type.Getter;
            if (this._property.hasSetter()) return WebInspector.PropertyPath.Type.Setter;
            return WebInspector.PropertyPath.Type.Value;
        }
    }, {
        key: "propertyPathString",
        value: function propertyPathString(propertyPath) {
            if (propertyPath.isFullPathImpossible()) return WebInspector.UIString("Unable to determine path to property from root");

            return propertyPath.displayPath(this.propertyPathType());
        }
    }, {
        key: "createGetterElement",
        value: function createGetterElement(interactive) {
            var getterElement = document.createElement("img");
            getterElement.className = "getter";

            if (!interactive) {
                getterElement.classList.add("disabled");
                getterElement.title = WebInspector.UIString("Getter");
                return getterElement;
            }

            getterElement.title = WebInspector.UIString("Invoke getter");
            getterElement.addEventListener("click", (function (event) {
                event.stopPropagation();
                var lastNonPrototypeObject = this._propertyPath.lastNonPrototypeObject;
                var getterObject = this._property.get;
                lastNonPrototypeObject.invokeGetter(getterObject, (function (error, result, wasThrown) {
                    this._getterHadError = !!(error || wasThrown);
                    this._getterValue = result;
                    if (this.invokedGetter && typeof this.invokedGetter === "function") this.invokedGetter();
                }).bind(this));
            }).bind(this));

            return getterElement;
        }
    }, {
        key: "createSetterElement",
        value: function createSetterElement(interactive) {
            var setterElement = document.createElement("img");
            setterElement.className = "setter";
            setterElement.title = WebInspector.UIString("Setter");

            if (!interactive) setterElement.classList.add("disabled");

            return setterElement;
        }

        // Private

    }, {
        key: "_logSymbolProperty",
        value: function _logSymbolProperty() {
            var symbol = this._property.symbol;
            if (!symbol) return;

            var text = WebInspector.UIString("Selected Symbol");
            WebInspector.consoleLogViewController.appendImmediateExecutionWithResult(text, symbol, true);
        }
    }, {
        key: "_logValue",
        value: function _logValue(value) {
            var resolvedValue = value || this.resolvedValue();
            if (!resolvedValue) return;

            var propertyPath = this.resolvedValuePropertyPath();
            var isImpossible = propertyPath.isFullPathImpossible();
            var text = isImpossible ? WebInspector.UIString("Selected Value") : propertyPath.displayPath(this.propertyPathType());

            if (!isImpossible) WebInspector.quickConsole.prompt.pushHistoryItem(text);

            WebInspector.consoleLogViewController.appendImmediateExecutionWithResult(text, resolvedValue, isImpossible);
        }
    }, {
        key: "_contextMenuHandler",
        value: function _contextMenuHandler(event) {
            var contextMenu = new WebInspector.ContextMenu(event);

            if (typeof this.treeOutline.objectTreeElementAddContextMenuItems === "function") {
                this.treeOutline.objectTreeElementAddContextMenuItems(this, contextMenu);
                if (!contextMenu.isEmpty()) contextMenu.appendSeparator();
            }

            var resolvedValue = this.resolvedValue();
            if (!resolvedValue) {
                if (!contextMenu.isEmpty()) contextMenu.show();
                return;
            }

            if (this._property && this._property.symbol) contextMenu.appendItem(WebInspector.UIString("Log Symbol"), this._logSymbolProperty.bind(this));

            contextMenu.appendItem(WebInspector.UIString("Log Value"), this._logValue.bind(this));

            var propertyPath = this.resolvedValuePropertyPath();
            if (propertyPath && !propertyPath.isFullPathImpossible()) {
                contextMenu.appendItem(WebInspector.UIString("Copy Path to Property"), (function () {
                    InspectorFrontendHost.copyText(propertyPath.displayPath(WebInspector.PropertyPath.Type.Value));
                }).bind(this));
            }

            contextMenu.appendSeparator();

            this._appendMenusItemsForObject(contextMenu, resolvedValue);

            contextMenu.show();
        }
    }, {
        key: "_appendMenusItemsForObject",
        value: function _appendMenusItemsForObject(contextMenu, resolvedValue) {
            if (resolvedValue.type === "function") {
                // FIXME: We should better handle bound functions.
                if (!isFunctionStringNativeCode(resolvedValue.description)) {
                    contextMenu.appendItem(WebInspector.UIString("Jump to Definition"), function () {
                        DebuggerAgent.getFunctionDetails(resolvedValue.objectId, function (error, response) {
                            if (error) return;

                            var location = response.location;
                            var sourceCode = WebInspector.debuggerManager.scriptForIdentifier(location.scriptId);
                            if (!sourceCode) return;

                            var sourceCodeLocation = sourceCode.createSourceCodeLocation(location.lineNumber, location.columnNumber || 0);
                            WebInspector.showSourceCodeLocation(sourceCodeLocation);
                        });
                    });
                }
                return;
            }

            if (resolvedValue.subtype === "node") {
                contextMenu.appendItem(WebInspector.UIString("Copy as HTML"), function () {
                    resolvedValue.pushNodeToFrontend(function (nodeId) {
                        WebInspector.domTreeManager.nodeForId(nodeId).copyNode();
                    });
                });

                contextMenu.appendItem(WebInspector.UIString("Scroll Into View"), function () {
                    function scrollIntoView() {
                        this.scrollIntoViewIfNeeded(true);
                    }
                    resolvedValue.callFunction(scrollIntoView, undefined, false, function () {});
                });

                contextMenu.appendSeparator();

                contextMenu.appendItem(WebInspector.UIString("Reveal in DOM Tree"), function () {
                    resolvedValue.pushNodeToFrontend(function (nodeId) {
                        WebInspector.domTreeManager.inspectElement(nodeId);
                    });
                });
                return;
            }
        }
    }, {
        key: "property",
        get: function get() {
            return this._property;
        }
    }, {
        key: "propertyPath",
        get: function get() {
            return this._propertyPath;
        }
    }]);

    return ObjectTreeBaseTreeElement;
})(WebInspector.GeneralTreeElement);

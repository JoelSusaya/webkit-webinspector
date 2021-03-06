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

WebInspector.BreakpointPopoverController = (function (_WebInspector$Object) {
    _inherits(BreakpointPopoverController, _WebInspector$Object);

    function BreakpointPopoverController() {
        _classCallCheck(this, BreakpointPopoverController);

        _get(Object.getPrototypeOf(BreakpointPopoverController.prototype), "constructor", this).call(this);

        this._breakpoint = null;
        this._popover = null;
        this._popoverContentElement = null;
        this._keyboardShortcutEsc = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Escape);
        this._keyboardShortcutEnter = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Enter);
    }

    // Public

    _createClass(BreakpointPopoverController, [{
        key: "appendContextMenuItems",
        value: function appendContextMenuItems(contextMenu, breakpoint, breakpointDisplayElement) {
            console.assert(document.body.contains(breakpointDisplayElement), "Breakpoint popover display element must be in the DOM.");

            function editBreakpoint() {
                console.assert(!this._popover, "Breakpoint popover already exists.");
                if (this._popover) return;

                this._createPopoverContent(breakpoint);
                this._popover = new WebInspector.Popover(this);
                this._popover.content = this._popoverContentElement;

                var bounds = WebInspector.Rect.rectFromClientRect(breakpointDisplayElement.getBoundingClientRect());
                bounds.origin.x -= 1; // Move the anchor left one pixel so it looks more centered.
                this._popover.present(bounds.pad(2), [WebInspector.RectEdge.MAX_Y]);

                document.getElementById(WebInspector.BreakpointPopoverController.PopoverConditionInputId).select();
            }

            function removeBreakpoint() {
                WebInspector.debuggerManager.removeBreakpoint(breakpoint);
            }

            function toggleBreakpoint() {
                breakpoint.disabled = !breakpoint.disabled;
            }

            function toggleAutoContinue() {
                breakpoint.autoContinue = !breakpoint.autoContinue;
            }

            function revealOriginalSourceCodeLocation() {
                WebInspector.showOriginalOrFormattedSourceCodeLocation(breakpoint.sourceCodeLocation);
            }

            if (WebInspector.debuggerManager.isBreakpointEditable(breakpoint)) contextMenu.appendItem(WebInspector.UIString("Edit Breakpoint…"), editBreakpoint.bind(this));

            if (breakpoint.autoContinue && !breakpoint.disabled) {
                contextMenu.appendItem(WebInspector.UIString("Disable Breakpoint"), toggleBreakpoint.bind(this));
                contextMenu.appendItem(WebInspector.UIString("Cancel Automatic Continue"), toggleAutoContinue.bind(this));
            } else if (!breakpoint.disabled) contextMenu.appendItem(WebInspector.UIString("Disable Breakpoint"), toggleBreakpoint.bind(this));else contextMenu.appendItem(WebInspector.UIString("Enable Breakpoint"), toggleBreakpoint.bind(this));

            if (!breakpoint.autoContinue && !breakpoint.disabled && breakpoint.actions.length) contextMenu.appendItem(WebInspector.UIString("Set to Automatically Continue"), toggleAutoContinue.bind(this));

            if (WebInspector.debuggerManager.isBreakpointRemovable(breakpoint)) {
                contextMenu.appendSeparator();
                contextMenu.appendItem(WebInspector.UIString("Delete Breakpoint"), removeBreakpoint.bind(this));
            }

            if (breakpoint._sourceCodeLocation.hasMappedLocation()) {
                contextMenu.appendSeparator();
                contextMenu.appendItem(WebInspector.UIString("Reveal in Original Resource"), revealOriginalSourceCodeLocation.bind(this));
            }
        }

        // Private

    }, {
        key: "_createPopoverContent",
        value: function _createPopoverContent(breakpoint) {
            console.assert(!this._popoverContentElement, "Popover content element already exists.");
            if (this._popoverContentElement) return;

            this._breakpoint = breakpoint;
            this._popoverContentElement = document.createElement("div");
            this._popoverContentElement.className = "edit-breakpoint-popover-content";

            var checkboxElement = document.createElement("input");
            checkboxElement.type = "checkbox";
            checkboxElement.checked = !this._breakpoint.disabled;
            checkboxElement.addEventListener("change", this._popoverToggleEnabledCheckboxChanged.bind(this));

            var checkboxLabel = document.createElement("label");
            checkboxLabel.className = "toggle";
            checkboxLabel.appendChild(checkboxElement);
            checkboxLabel.append(this._breakpoint.sourceCodeLocation.displayLocationString());

            var table = document.createElement("table");

            var conditionRow = table.appendChild(document.createElement("tr"));
            var conditionHeader = conditionRow.appendChild(document.createElement("th"));
            var conditionData = conditionRow.appendChild(document.createElement("td"));
            var conditionLabel = conditionHeader.appendChild(document.createElement("label"));
            var conditionInput = conditionData.appendChild(document.createElement("input"));
            conditionInput.id = WebInspector.BreakpointPopoverController.PopoverConditionInputId;
            conditionInput.value = this._breakpoint.condition || "";
            conditionInput.spellcheck = false;
            conditionInput.addEventListener("change", this._popoverConditionInputChanged.bind(this));
            conditionInput.addEventListener("keydown", this._popoverConditionInputKeyDown.bind(this));
            conditionInput.placeholder = WebInspector.UIString("Conditional expression");
            conditionLabel.setAttribute("for", conditionInput.id);
            conditionLabel.textContent = WebInspector.UIString("Condition");

            // COMPATIBILITY (iOS 7): Debugger.setBreakpoint did not support options.
            if (DebuggerAgent.setBreakpoint.supports("options")) {
                var actionRow = table.appendChild(document.createElement("tr"));
                var actionHeader = actionRow.appendChild(document.createElement("th"));
                var actionData = this._actionsContainer = actionRow.appendChild(document.createElement("td"));
                var actionLabel = actionHeader.appendChild(document.createElement("label"));
                actionLabel.textContent = WebInspector.UIString("Action");

                if (!this._breakpoint.actions.length) this._popoverActionsCreateAddActionButton();else {
                    this._popoverContentElement.classList.add(WebInspector.BreakpointPopoverController.WidePopoverClassName);
                    for (var i = 0; i < this._breakpoint.actions.length; ++i) {
                        var breakpointActionView = new WebInspector.BreakpointActionView(this._breakpoint.actions[i], this, true);
                        this._popoverActionsInsertBreakpointActionView(breakpointActionView, i);
                    }
                }

                var optionsRow = this._popoverOptionsRowElement = table.appendChild(document.createElement("tr"));
                if (!this._breakpoint.actions.length) optionsRow.classList.add(WebInspector.BreakpointPopoverController.HiddenStyleClassName);
                var optionsHeader = optionsRow.appendChild(document.createElement("th"));
                var optionsData = optionsRow.appendChild(document.createElement("td"));
                var optionsLabel = optionsHeader.appendChild(document.createElement("label"));
                var optionsCheckbox = this._popoverOptionsCheckboxElement = optionsData.appendChild(document.createElement("input"));
                var optionsCheckboxLabel = optionsData.appendChild(document.createElement("label"));
                optionsCheckbox.id = "edit-breakpoint-popoover-auto-continue";
                optionsCheckbox.type = "checkbox";
                optionsCheckbox.checked = this._breakpoint.autoContinue;
                optionsCheckbox.addEventListener("change", this._popoverToggleAutoContinueCheckboxChanged.bind(this));
                optionsLabel.textContent = WebInspector.UIString("Options");
                optionsCheckboxLabel.setAttribute("for", optionsCheckbox.id);
                optionsCheckboxLabel.textContent = WebInspector.UIString("Automatically continue after evaluating");
            }

            this._popoverContentElement.appendChild(checkboxLabel);
            this._popoverContentElement.appendChild(table);
        }
    }, {
        key: "_popoverToggleEnabledCheckboxChanged",
        value: function _popoverToggleEnabledCheckboxChanged(event) {
            this._breakpoint.disabled = !event.target.checked;
        }
    }, {
        key: "_popoverConditionInputChanged",
        value: function _popoverConditionInputChanged(event) {
            this._breakpoint.condition = event.target.value;
        }
    }, {
        key: "_popoverToggleAutoContinueCheckboxChanged",
        value: function _popoverToggleAutoContinueCheckboxChanged(event) {
            this._breakpoint.autoContinue = event.target.checked;
        }
    }, {
        key: "_popoverConditionInputKeyDown",
        value: function _popoverConditionInputKeyDown(event) {
            if (this._keyboardShortcutEsc.matchesEvent(event) || this._keyboardShortcutEnter.matchesEvent(event)) {
                this._popover.dismiss();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }, {
        key: "_popoverActionsCreateAddActionButton",
        value: function _popoverActionsCreateAddActionButton() {
            this._popoverContentElement.classList.remove(WebInspector.BreakpointPopoverController.WidePopoverClassName);
            this._actionsContainer.removeChildren();

            var addActionButton = this._actionsContainer.appendChild(document.createElement("button"));
            addActionButton.textContent = WebInspector.UIString("Add Action");
            addActionButton.addEventListener("click", this._popoverActionsAddActionButtonClicked.bind(this));
        }
    }, {
        key: "_popoverActionsAddActionButtonClicked",
        value: function _popoverActionsAddActionButtonClicked(event) {
            this._popoverContentElement.classList.add(WebInspector.BreakpointPopoverController.WidePopoverClassName);
            this._actionsContainer.removeChildren();

            var newAction = this._breakpoint.createAction(WebInspector.Breakpoint.DefaultBreakpointActionType);
            var newBreakpointActionView = new WebInspector.BreakpointActionView(newAction, this);
            this._popoverActionsInsertBreakpointActionView(newBreakpointActionView, -1);
            this._popoverOptionsRowElement.classList.remove(WebInspector.BreakpointPopoverController.HiddenStyleClassName);
            this._popover.update();
        }
    }, {
        key: "_popoverActionsInsertBreakpointActionView",
        value: function _popoverActionsInsertBreakpointActionView(breakpointActionView, index) {
            if (index === -1) this._actionsContainer.appendChild(breakpointActionView.element);else {
                var nextElement = this._actionsContainer.children[index + 1] || null;
                this._actionsContainer.insertBefore(breakpointActionView.element, nextElement);
            }
        }
    }, {
        key: "breakpointActionViewAppendActionView",
        value: function breakpointActionViewAppendActionView(breakpointActionView, newAction) {
            var newBreakpointActionView = new WebInspector.BreakpointActionView(newAction, this);

            var index = 0;
            var children = this._actionsContainer.children;
            for (var i = 0; children.length; ++i) {
                if (children[i] === breakpointActionView.element) {
                    index = i;
                    break;
                }
            }

            this._popoverActionsInsertBreakpointActionView(newBreakpointActionView, index);
            this._popoverOptionsRowElement.classList.remove(WebInspector.BreakpointPopoverController.HiddenStyleClassName);

            this._popover.update();
        }
    }, {
        key: "breakpointActionViewRemoveActionView",
        value: function breakpointActionViewRemoveActionView(breakpointActionView) {
            breakpointActionView.element.remove();

            if (!this._actionsContainer.children.length) {
                this._popoverActionsCreateAddActionButton();
                this._popoverOptionsRowElement.classList.add(WebInspector.BreakpointPopoverController.HiddenStyleClassName);
                this._popoverOptionsCheckboxElement.checked = false;
            }

            this._popover.update();
        }
    }, {
        key: "breakpointActionViewResized",
        value: function breakpointActionViewResized(breakpointActionView) {
            this._popover.update();
        }
    }, {
        key: "willDismissPopover",
        value: function willDismissPopover(popover) {
            console.assert(this._popover === popover);
            this._popoverContentElement = null;
            this._popoverOptionsRowElement = null;
            this._popoverOptionsCheckboxElement = null;
            this._actionsContainer = null;
            this._popover = null;
        }
    }, {
        key: "didDismissPopover",
        value: function didDismissPopover(popover) {
            // Remove Evaluate and Probe actions that have no data.
            var emptyActions = this._breakpoint.actions.filter(function (action) {
                if (action.type !== WebInspector.BreakpointAction.Type.Evaluate && action.type !== WebInspector.BreakpointAction.Type.Probe) return false;
                return !(action.data && action.data.trim());
            });

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = emptyActions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var action = _step.value;

                    this._breakpoint.removeAction(action);
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

            this._breakpoint = null;
        }
    }]);

    return BreakpointPopoverController;
})(WebInspector.Object);

WebInspector.BreakpointPopoverController.WidePopoverClassName = "wide";
WebInspector.BreakpointPopoverController.PopoverConditionInputId = "edit-breakpoint-popover-condition";
WebInspector.BreakpointPopoverController.HiddenStyleClassName = "hidden";

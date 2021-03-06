/*
 * Copyright (C) 2013 University of Washington. All rights reserved.
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.ProbeDetailsSidebarPanel = function () {
    WebInspector.DetailsSidebarPanel.call(this, "probe", WebInspector.UIString("Probes"), WebInspector.UIString("Probes"), "Images/NavigationItemProbes.pdf", "6");

    WebInspector.probeManager.addEventListener(WebInspector.ProbeManager.Event.ProbeSetAdded, this._probeSetAdded, this);
    WebInspector.probeManager.addEventListener(WebInspector.ProbeManager.Event.ProbeSetRemoved, this._probeSetRemoved, this);

    this._probeSetSections = new Map();
    this._inspectedProbeSets = [];

    // Initialize sidebar sections for probe sets that already exist.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = WebInspector.probeManager.probeSets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var probeSet = _step.value;

            this._probeSetAdded(probeSet);
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
};

WebInspector.ProbeDetailsSidebarPanel.OffsetSectionsStyleClassName = "offset-sections";

WebInspector.ProbeDetailsSidebarPanel.prototype = Object.defineProperties({
    constructor: WebInspector.ProbeDetailsSidebarPanel,
    __proto__: WebInspector.DetailsSidebarPanel.prototype,

    inspect: function inspect(objects) {
        if (!(objects instanceof Array)) objects = [objects];

        var inspectedProbeSets = objects.filter(function (object) {
            return object instanceof WebInspector.ProbeSet;
        });

        inspectedProbeSets.sort(function sortBySourceLocation(aProbeSet, bProbeSet) {
            var aLocation = aProbeSet.breakpoint.sourceCodeLocation;
            var bLocation = bProbeSet.breakpoint.sourceCodeLocation;
            var comparisonResult = aLocation.sourceCode.displayName.localeCompare(bLocation.sourceCode.displayName);
            if (comparisonResult !== 0) return comparisonResult;

            comparisonResult = aLocation.displayLineNumber - bLocation.displayLineNumber;
            if (comparisonResult !== 0) return comparisonResult;

            return aLocation.displayColumnNumber - bLocation.displayColumnNumber;
        });

        this.inspectedProbeSets = inspectedProbeSets;

        return !!this._inspectedProbeSets.length;
    },

    // Private

    _probeSetAdded: function _probeSetAdded(probeSetOrEvent) {
        var probeSet;
        if (probeSetOrEvent instanceof WebInspector.ProbeSet) probeSet = probeSetOrEvent;else probeSet = probeSetOrEvent.data.probeSet;
        console.assert(!this._probeSetSections.has(probeSet), "New probe group ", probeSet, " already has its own sidebar.");

        var newSection = new WebInspector.ProbeSetDetailsSection(probeSet);
        this._probeSetSections.set(probeSet, newSection);
    },

    _probeSetRemoved: function _probeSetRemoved(event) {
        var probeSet = event.data.probeSet;
        console.assert(this._probeSetSections.has(probeSet), "Removed probe group ", probeSet, " doesn't have a sidebar.");

        // First remove probe set from inspected list, then from mapping.
        var inspectedProbeSets = this.inspectedProbeSets;
        var index = inspectedProbeSets.indexOf(probeSet);
        if (index !== -1) {
            inspectedProbeSets.splice(index, 1);
            this.inspectedProbeSets = inspectedProbeSets;
        }
        var removedSection = this._probeSetSections.get(probeSet);
        this._probeSetSections["delete"](probeSet);
        removedSection.closed();
    }
}, {
    inspectedProbeSets: { // Public

        get: function get() {
            return this._inspectedProbeSets.slice();
        },
        set: function set(newProbeSets) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._inspectedProbeSets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var probeSet = _step2.value;

                    var removedSection = this._probeSetSections.get(probeSet);
                    this.element.removeChild(removedSection.element);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            this._inspectedProbeSets = newProbeSets;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = newProbeSets[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var probeSet = _step3.value;

                    var shownSection = this._probeSetSections.get(probeSet);
                    this.element.appendChild(shownSection.element);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        },
        configurable: true,
        enumerable: true
    }
});

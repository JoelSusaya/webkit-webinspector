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

WebInspector.ReplaySession = function (identifier) {
    WebInspector.Object.call(this);

    this.identifier = identifier;
    this._segments = [];
    this._timestamp = null;
};

WebInspector.ReplaySession.fromPayload = function (identifier, payload) {
    var session = new WebInspector.ReplaySession(identifier);
    session._updateFromPayload(payload);
    return session;
};

WebInspector.ReplaySession.Event = {
    SegmentsChanged: "replay-session-segments-changed"
};

WebInspector.ReplaySession.prototype = Object.defineProperties({
    constructor: WebInspector.ReplaySession,
    __proto__: WebInspector.Object.prototype,

    segmentsChanged: function segmentsChanged() {
        // The replay manager won't update the session's list of segments nor create a new session.
        ReplayAgent.getSessionData.promise(this.identifier).then(this._updateFromPayload.bind(this));
    },

    _updateFromPayload: function _updateFromPayload(payload) {
        var session = payload.session;
        console.assert(session.id === this.identifier);

        var segmentIds = session.segments;
        var oldSegments = this._segments;
        var pendingSegments = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = segmentIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var segmentId = _step.value;

                pendingSegments.push(WebInspector.replayManager.getSegment(segmentId));
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

        var session = this;
        Promise.all(pendingSegments).then(function (segmentsArray) {
            session._segments = segmentsArray;
            session.dispatchEventToListeners(WebInspector.ReplaySession.Event.SegmentsChanged, { oldSegments: oldSegments });
        }, function (error) {
            console.error("Problem resolving segments: ", error);
        });
    }
}, {
    segments: {
        get: function get() {
            return this._segments.slice();
        },
        configurable: true,
        enumerable: true
    }
});
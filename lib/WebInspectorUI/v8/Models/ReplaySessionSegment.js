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

WebInspector.IncompleteSessionSegment = function (identifier) {
    WebInspector.Object.call(this);

    this.identifier = identifier;
    this._timestamp = Date.now();
};

WebInspector.IncompleteSessionSegment.prototype = Object.defineProperties({
    constructor: WebInspector.IncompleteSessionSegment,
    __proto__: WebInspector.Object.prototype

}, {
    isComplete: {
        get: function get() {
            return false;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.ReplaySessionSegment = function (identifier, payload) {
    WebInspector.Object.call(this);

    var segment = payload.segment;
    console.assert(identifier === segment.id);

    this.identifier = identifier;
    this._timestamp = segment.timestamp;

    this._queues = segment.queues;
};

WebInspector.ReplaySessionSegment.prototype = Object.defineProperties({
    constructor: WebInspector.ReplaySessionSegment,
    __proto__: WebInspector.Object.prototype

}, {
    isComplete: {
        get: function get() {
            return true;
        },
        configurable: true,
        enumerable: true
    }
});

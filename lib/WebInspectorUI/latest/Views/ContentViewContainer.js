var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
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

WebInspector.ContentViewContainer = (function (_WebInspector$Object) {
    _inherits(ContentViewContainer, _WebInspector$Object);

    function ContentViewContainer(element) {
        _classCallCheck(this, ContentViewContainer);

        _get(Object.getPrototypeOf(ContentViewContainer.prototype), "constructor", this).call(this);

        this._element = element || document.createElement("div");
        this._element.classList.add("content-view-container");

        this._backForwardList = [];
        this._currentIndex = -1;
    }

    // Public

    _createClass(ContentViewContainer, [{
        key: "updateLayout",
        value: function updateLayout() {
            var currentContentView = this.currentContentView;
            if (currentContentView) currentContentView.updateLayout();
        }
    }, {
        key: "contentViewForRepresentedObject",
        value: function contentViewForRepresentedObject(representedObject, onlyExisting, extraArguments) {
            console.assert(representedObject);
            if (!representedObject) return null;

            // Iterate over all the known content views for the representedObject (if any) and find one that doesn't
            // have a parent container or has this container as its parent.
            var contentView = null;
            for (var i = 0; representedObject.__contentViews && i < representedObject.__contentViews.length; ++i) {
                var currentContentView = representedObject.__contentViews[i];
                if (!currentContentView._parentContainer || currentContentView._parentContainer === this) {
                    contentView = currentContentView;
                    break;
                }
            }

            console.assert(!contentView || contentView instanceof WebInspector.ContentView);
            if (contentView instanceof WebInspector.ContentView) return contentView;

            // Return early to avoid creating a new content view when onlyExisting is true.
            if (onlyExisting) return null;

            // No existing content view found, make a new one.
            contentView = WebInspector.ContentView.createFromRepresentedObject(representedObject, extraArguments);

            console.assert(contentView, "Unknown representedObject", representedObject);
            if (!contentView) return null;

            // The representedObject can change in the constructor for ContentView. Remember the
            // contentViews on the real representedObject and not the one originally supplied.
            // The main case for this is a Frame being passed in and the main Resource being used.
            representedObject = contentView.representedObject;

            // Remember this content view for future calls.
            if (!representedObject.__contentViews) representedObject.__contentViews = [];
            representedObject.__contentViews.push(contentView);

            return contentView;
        }
    }, {
        key: "showContentViewForRepresentedObject",
        value: function showContentViewForRepresentedObject(representedObject, extraArguments) {
            var contentView = this.contentViewForRepresentedObject(representedObject, false, extraArguments);
            if (!contentView) return null;

            this.showContentView(contentView);

            return contentView;
        }
    }, {
        key: "showContentView",
        value: function showContentView(contentView, cookie) {
            console.assert(contentView instanceof WebInspector.ContentView);
            if (!(contentView instanceof WebInspector.ContentView)) return null;

            // Don't allow showing a content view that is already associated with another container.
            // Showing a content view that is already associated with this container is allowed.
            console.assert(!contentView.parentContainer || contentView.parentContainer === this);
            if (contentView.parentContainer && contentView.parentContainer !== this) return null;

            var currentEntry = this.currentBackForwardEntry;
            var provisionalEntry = new WebInspector.BackForwardEntry(contentView, cookie);
            // Don't do anything if we would have added an identical back/forward list entry.
            if (currentEntry && currentEntry.contentView === contentView && Object.shallowEqual(provisionalEntry.cookie, currentEntry.cookie)) {
                var shouldCallShown = false;
                currentEntry.prepareToShow(shouldCallShown);
                return currentEntry.contentView;
            }

            // Showing a content view will truncate the back/forward list after the current index and insert the content view
            // at the end of the list. Finally, the current index will be updated to point to the end of the back/forward list.

            // Increment the current index to where we will insert the content view.
            var newIndex = this._currentIndex + 1;

            // Insert the content view at the new index. This will remove any content views greater than or equal to the index.
            var removedEntries = this._backForwardList.splice(newIndex, this._backForwardList.length - newIndex, provisionalEntry);

            console.assert(newIndex === this._backForwardList.length - 1);
            console.assert(this._backForwardList[newIndex] === provisionalEntry);

            // Disassociate with the removed content views.
            for (var i = 0; i < removedEntries.length; ++i) {
                // Skip disassociation if this content view is still in the back/forward list.
                var shouldDissociateContentView = !this._backForwardList.some(function (existingEntry) {
                    return existingEntry.contentView === removedEntries[i].contentView;
                });

                if (shouldDissociateContentView) this._disassociateFromContentView(removedEntries[i].contentView);
            }

            // Associate with the new content view.
            contentView._parentContainer = this;

            this.showBackForwardEntryForIndex(newIndex);

            return contentView;
        }
    }, {
        key: "showBackForwardEntryForIndex",
        value: function showBackForwardEntryForIndex(index) {
            console.assert(index >= 0 && index <= this._backForwardList.length - 1);
            if (index < 0 || index > this._backForwardList.length - 1) return;

            if (this._currentIndex === index) return;

            var previousEntry = this.currentBackForwardEntry;
            this._currentIndex = index;
            var currentEntry = this.currentBackForwardEntry;
            console.assert(currentEntry);

            var isNewContentView = !previousEntry || !currentEntry.contentView.visible;
            if (isNewContentView) {
                // Hide the currently visible content view.
                if (previousEntry) this._hideEntry(previousEntry);
                this._showEntry(currentEntry, true);
            } else this._showEntry(currentEntry, false);

            this.dispatchEventToListeners(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange);
        }
    }, {
        key: "replaceContentView",
        value: function replaceContentView(oldContentView, newContentView) {
            console.assert(oldContentView instanceof WebInspector.ContentView);
            if (!(oldContentView instanceof WebInspector.ContentView)) return;

            console.assert(newContentView instanceof WebInspector.ContentView);
            if (!(newContentView instanceof WebInspector.ContentView)) return;

            console.assert(oldContentView.parentContainer === this);
            if (oldContentView.parentContainer !== this) return;

            console.assert(!newContentView.parentContainer || newContentView.parentContainer === this);
            if (newContentView.parentContainer && newContentView.parentContainer !== this) return;

            var currentlyShowing = this.currentContentView === oldContentView;
            if (currentlyShowing) this._hideEntry(this.currentBackForwardEntry);

            // Disassociate with the old content view.
            this._disassociateFromContentView(oldContentView);

            // Associate with the new content view.
            newContentView._parentContainer = this;

            // Replace all occurrences of oldContentView with newContentView in the back/forward list.
            for (var i = 0; i < this._backForwardList.length; ++i) {
                if (this._backForwardList[i].contentView === oldContentView) this._backForwardList[i].contentView = newContentView;
            }

            // Re-show the current entry, because its content view instance was replaced.
            if (currentlyShowing) {
                this._showEntry(this.currentBackForwardEntry, true);
                this.dispatchEventToListeners(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange);
            }
        }
    }, {
        key: "closeAllContentViewsOfPrototype",
        value: function closeAllContentViewsOfPrototype(constructor) {
            if (!this._backForwardList.length) {
                console.assert(this._currentIndex === -1);
                return;
            }

            // Do a check to see if all the content views are instances of this prototype.
            // If they all are we can use the quicker closeAllContentViews method.
            var allSamePrototype = true;
            for (var i = this._backForwardList.length - 1; i >= 0; --i) {
                if (!(this._backForwardList[i].contentView instanceof constructor)) {
                    allSamePrototype = false;
                    break;
                }
            }

            if (allSamePrototype) {
                this.closeAllContentViews();
                return;
            }

            var visibleContentView = this.currentContentView;

            var backForwardListDidChange = false;
            // Hide and disassociate with all the content views that are instances of the constructor.
            for (var i = this._backForwardList.length - 1; i >= 0; --i) {
                var entry = this._backForwardList[i];
                if (!(entry.contentView instanceof constructor)) continue;

                if (entry.contentView === visibleContentView) this._hideEntry(entry);

                if (this._currentIndex >= i) {
                    // Decrement the currentIndex since we will remove an item in the back/forward array
                    // that it the current index or comes before it.
                    --this._currentIndex;
                }

                this._disassociateFromContentView(entry.contentView);

                // Remove the item from the back/forward list.
                this._backForwardList.splice(i, 1);
                backForwardListDidChange = true;
            }

            var currentEntry = this.currentBackForwardEntry;
            console.assert(currentEntry || !currentEntry && this._currentIndex === -1);

            if (currentEntry && currentEntry.contentView !== visibleContentView || backForwardListDidChange) {
                this._showEntry(currentEntry, true);
                this.dispatchEventToListeners(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange);
            }
        }
    }, {
        key: "closeContentView",
        value: function closeContentView(contentViewToClose) {
            if (!this._backForwardList.length) {
                console.assert(this._currentIndex === -1);
                return;
            }

            // Do a check to see if all the content views are instances of this prototype.
            // If they all are we can use the quicker closeAllContentViews method.
            var allSameContentView = true;
            for (var i = this._backForwardList.length - 1; i >= 0; --i) {
                if (this._backForwardList[i].contentView !== contentViewToClose) {
                    allSameContentView = false;
                    break;
                }
            }

            if (allSameContentView) {
                this.closeAllContentViews();
                return;
            }

            var visibleContentView = this.currentContentView;

            var backForwardListDidChange = false;
            // Hide and disassociate with all the content views that are the same as contentViewToClose.
            for (var i = this._backForwardList.length - 1; i >= 0; --i) {
                var entry = this._backForwardList[i];
                if (entry.contentView !== contentViewToClose) continue;

                if (entry.contentView === visibleContentView) this._hideEntry(entry);

                if (this._currentIndex >= i) {
                    // Decrement the currentIndex since we will remove an item in the back/forward array
                    // that it the current index or comes before it.
                    --this._currentIndex;
                }

                this._disassociateFromContentView(entry.contentView);

                // Remove the item from the back/forward list.
                this._backForwardList.splice(i, 1);
                backForwardListDidChange = true;
            }

            var currentEntry = this.currentBackForwardEntry;
            console.assert(currentEntry || !currentEntry && this._currentIndex === -1);

            if (currentEntry && currentEntry.contentView !== visibleContentView || backForwardListDidChange) {
                this._showEntry(currentEntry, true);
                this.dispatchEventToListeners(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange);
            }
        }
    }, {
        key: "closeAllContentViews",
        value: function closeAllContentViews() {
            if (!this._backForwardList.length) {
                console.assert(this._currentIndex === -1);
                return;
            }

            var visibleContentView = this.currentContentView;

            // Hide and disassociate with all the content views.
            for (var i = 0; i < this._backForwardList.length; ++i) {
                var entry = this._backForwardList[i];
                if (entry.contentView === visibleContentView) this._hideEntry(entry);
                this._disassociateFromContentView(entry.contentView);
            }

            this._backForwardList = [];
            this._currentIndex = -1;

            this.dispatchEventToListeners(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange);
        }
    }, {
        key: "canGoBack",
        value: function canGoBack() {
            return this._currentIndex > 0;
        }
    }, {
        key: "canGoForward",
        value: function canGoForward() {
            return this._currentIndex < this._backForwardList.length - 1;
        }
    }, {
        key: "goBack",
        value: function goBack() {
            if (!this.canGoBack()) return;
            this.showBackForwardEntryForIndex(this._currentIndex - 1);
        }
    }, {
        key: "goForward",
        value: function goForward() {
            if (!this.canGoForward()) return;
            this.showBackForwardEntryForIndex(this._currentIndex + 1);
        }
    }, {
        key: "shown",
        value: function shown() {
            var currentEntry = this.currentBackForwardEntry;
            if (!currentEntry) return;

            this._showEntry(currentEntry, true);
        }
    }, {
        key: "hidden",
        value: function hidden() {
            var currentEntry = this.currentBackForwardEntry;
            if (!currentEntry) return;

            this._hideEntry(currentEntry);
        }

        // Private

    }, {
        key: "_addContentViewElement",
        value: function _addContentViewElement(contentView) {
            if (contentView.element.parentNode !== this._element) this._element.appendChild(contentView.element);
        }
    }, {
        key: "_removeContentViewElement",
        value: function _removeContentViewElement(contentView) {
            if (contentView.element.parentNode) contentView.element.parentNode.removeChild(contentView.element);
        }
    }, {
        key: "_disassociateFromContentView",
        value: function _disassociateFromContentView(contentView) {
            console.assert(!contentView.visible);

            if (!contentView._parentContainer) return;

            contentView._parentContainer = null;

            var representedObject = contentView.representedObject;
            if (representedObject && representedObject.__contentViews) representedObject.__contentViews.remove(contentView);

            contentView.closed();
        }
    }, {
        key: "_showEntry",
        value: function _showEntry(entry, shouldCallShown) {
            console.assert(entry instanceof WebInspector.BackForwardEntry);

            this._addContentViewElement(entry.contentView);
            entry.prepareToShow(shouldCallShown);
        }
    }, {
        key: "_hideEntry",
        value: function _hideEntry(entry) {
            console.assert(entry instanceof WebInspector.BackForwardEntry);

            entry.prepareToHide();
            this._removeContentViewElement(entry.contentView);
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "currentIndex",
        get: function get() {
            return this._currentIndex;
        }
    }, {
        key: "backForwardList",
        get: function get() {
            return this._backForwardList;
        }
    }, {
        key: "currentContentView",
        get: function get() {
            if (this._currentIndex < 0 || this._currentIndex > this._backForwardList.length - 1) return null;
            return this._backForwardList[this._currentIndex].contentView;
        }
    }, {
        key: "currentBackForwardEntry",
        get: function get() {
            if (this._currentIndex < 0 || this._currentIndex > this._backForwardList.length - 1) return null;
            return this._backForwardList[this._currentIndex];
        }
    }]);

    return ContentViewContainer;
})(WebInspector.Object);

WebInspector.ContentViewContainer.Event = {
    CurrentContentViewDidChange: "content-view-container-current-content-view-did-change"
};

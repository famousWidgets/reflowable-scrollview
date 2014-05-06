/*globals define*/
define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');
    var ViewSequence = require('famous/core/ViewSequence');
    var Utility = require('famous/utilities/Utility');

    /*
     * @name reflowableScrollview
     * @constructor
     * @description
     */

/*

1) Create a reflowing / autosizing scrollview from http://codepen.io/befamous/pen/kbxnH
2) Before making a reusable widget, explore coding this as a view by whatever method seems
most natural to you. You will need to write some code that takes the views' size every frame
(either through context.size returned to you in the commit function or hacking it up with
window.innerWidth/Height) and then creating subviews that are packed correctly for
the width/height.
3) There's value in a naive first pass at implementing the scrollview.

*/

    function reflowableScrollview (options) {
        ScrollView.apply(this, arguments);
        this.setOptions(reflowableScrollview.DEFAULT_OPTIONS);
        this.setOptions(options);

        this._previousSize = [undefined, undefined];
        this._scroller.commit = _customCommit.bind(this);
    }

    reflowableScrollview.prototype = Object.create(ScrollView.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    reflowableScrollview.DEFAULT_OPTIONS = {
    };

    var _customCommit = function (context) {
        // 'this' will be an instance of reflowableScrollview
        var _scroller = this._scroller;

        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;

        if (this._previousSize[0] !== size[0] || this._previousSize[1] !== size[1]) {
            // console.log('prev: ', this.previousSize, ' new: ', size);
            this._previousSize[0] = size[0];
            this._previousSize[1] = size[1];

            _createNewViewSequence.call(this, context);
        }

        // reset edge detection on size change

        // we believe this isn't getting executed
        if (!_scroller.options.clipSize && (size[0] !== _scroller._contextSize[0] || size[1] !== _scroller._contextSize[1])) {
            _scroller._onEdge = 0;
            _scroller._contextSize = size;

            if (_scroller.options.direction === Utility.Direction.X) {
                _scroller._size[0] = _getClipSize.call(_scroller);
                _scroller._size[1] = undefined;
            }
            else {
                _scroller._size[0] = undefined;
                _scroller._size[1] = _getClipSize.call(_scroller);
            }
        }

        var scrollTransform = _scroller._masterOutputFunction(-_scroller._position);

        return {
            transform: Transform.multiply(transform, scrollTransform),
            opacity: opacity,
            origin: origin,
            target: _scroller.group.render()
        };
    };

    var _createNewViewSequence = function (context) {
        // 'this' will be an instance of reflowableScrollview
        this._originalArray = this._originalArray || this._node._.array;
        // console.log('this._originalArray: ', this._originalArray);

        var direction = this.options.direction;
        var contextSize = context.size; // window's size
        var result = [];

        var sizeSoFar = 0;
        if (direction === 0) {
            var currentView = new View({
                size: [100, undefined]
            });
        } else if (direction === 1) {
            var currentView = new View({
                size: [undefined, 100]
            });
        }
        var item;
        var currentItemSize;
        var maxItemSize = 0;
        var numberOfItems = 0;
        var spacingBetweenItems = [];
        var rowNumber = 0;
        var rowNumberCounter = 1;

        for (var i = 0; i < this._originalArray.length; i += 1) {

            item = this._originalArray[i];

            currentItemSize = (direction === 0 ? item.getSize()[1] : item.getSize()[0]);

            // Calculate spacing between each item
            if (sizeSoFar + currentItemSize < contextSize[direction === 0 ? 1 : 0]) {
                sizeSoFar += currentItemSize;
                numberOfItems += 1;
                if (i === this._originalArray.length - 1) {
                var gutter = (direction === 0 ? contextSize[1] : contextSize[0]) - sizeSoFar;
                    spacingBetweenItems.push([Math.floor(gutter/(numberOfItems - 1)), numberOfItems]);
                }
            } else {
                var gutter = (direction === 0 ? contextSize[1] : contextSize[0]) - sizeSoFar;
                spacingBetweenItems.push([Math.floor(gutter/(numberOfItems - 1)), numberOfItems]);
                sizeSoFar = 0;
                sizeSoFar += currentItemSize;
                numberOfItems = 1;
            }
        }

        sizeSoFar = 0;

        for (var i = 0; i < this._originalArray.length; i += 1) {
            // console.log('i is: ', i);
            item = this._originalArray[i];

            // console.log('item is: ', item);

            currentItemSize = direction === 0 ? item.getSize()[1] : item.getSize()[0];

            if (sizeSoFar + currentItemSize < contextSize[direction === 0 ? 1 : 0]) {
                 currentItemSize > maxItemSize ? maxItemSize = currentItemSize : false;
                _addToView.call(this,currentView, sizeSoFar === 0 ? sizeSoFar : (sizeSoFar + spacingBetweenItems[rowNumber][0] * (rowNumberCounter === spacingBetweenItems[rowNumber][1] ? rowNumberCounter : rowNumberCounter++)), item);
                sizeSoFar += currentItemSize;
            } else {
                // result array is populated enough
                result.push(currentView);
                // reset
                rowNumberCounter = 1;
                sizeSoFar = 0;
                currentView = new View({
                    size: direction === 1 ? [undefined, maxItemSize] : [maxItemSize, undefined]
                });

                _addToView.call(this, currentView, sizeSoFar === 0 ? sizeSoFar : sizeSoFar + spacingBetweenItems[rowNumber++], item);
                sizeSoFar += currentItemSize;

            }

                // remnant items in currentView
            if (i === this._originalArray.length - 1) {
                result.push(currentView);
            }
        }

        this.sequenceFrom.call(this, result);
    };

    var _addToView = function (view, offset, item) {
        var modifier = new StateModifier({
            transform: this.options.direction === 0 ? Transform.translate(0, offset, 0) : Transform.translate(offset, 0, 0)
        });
        view.add(modifier).add(item);
    };

    function _sizeForDir(size) {
        if (!size) size = this._contextSize;
        var dimension = (this.options.direction === Utility.Direction.X) ? 0 : 1;
        return (size[dimension] === undefined) ? this._contextSize[dimension] : size[dimension];
    }

    function _getClipSize() {
        if (this.options.clipSize) return this.options.clipSize;
        else return _sizeForDir.call(this, this._contextSize);
    }

    module.exports = reflowableScrollview;
});

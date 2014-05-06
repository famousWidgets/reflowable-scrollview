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

        // reset edge detection on size change
        // Implemented bug fix here
        if (!_scroller.options.clipSize && (size[0] !== _scroller._contextSize[0] || size[1] !== _scroller._contextSize[1])) {
            _scroller._onEdge = 0;
            _scroller._contextSize[0] = size[0];
            _scroller._contextSize[1] = size[1];
            _createNewViewSequence.call(this, context);

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

        var direction = this.options.direction;
        var contextSize = context.size; // this is an array
        var result = [];

        var accumulatedSize = 0;
        var currentView = new View();
        var sequenceItem;
        var currentSequenceItemSize;
        var maxSequenceItemSize = 0;
        var numSequenceItems = 0;
        var spacingBetweenItems = [];
        var rowNumber = 0;
        var rowNumberCounter = 1;
        var gutter;

        // Calculate spacing between each sequenceItem
        for (var i = 0; i < this._originalArray.length; i += 1) {
            sequenceItem = this._originalArray[i];

            currentSequenceItemSize = (direction === 0 ? sequenceItem.getSize()[1] : sequenceItem.getSize()[0]);

            if (accumulatedSize + currentSequenceItemSize < contextSize[direction === 0 ? 1 : 0]) {
                accumulatedSize += currentSequenceItemSize;
                numSequenceItems += 1;
                if (i === this._originalArray.length - 1) {
                gutter = (direction === 0 ? contextSize[1] : contextSize[0]) - accumulatedSize;
                    spacingBetweenItems.push([Math.floor(gutter/(numSequenceItems - 1)), numSequenceItems]);
                }
            } else {
                gutter = (direction === 0 ? contextSize[1] : contextSize[0]) - accumulatedSize;
                spacingBetweenItems.push([Math.floor(gutter/(numSequenceItems - 1)), numSequenceItems]);
                accumulatedSize = 0;
                accumulatedSize += currentSequenceItemSize;
                numSequenceItems = 1;
            }
        }

        accumulatedSize = 0;

        for (var j = 0; j < this._originalArray.length; j += 1) {
            // console.log('i is: ', i);
            sequenceItem = this._originalArray[j];

            // console.log('sequenceItem is: ', sequenceItem);

            currentSequenceItemSize = direction === 0 ? sequenceItem.getSize()[1] : sequenceItem.getSize()[0];

            if (accumulatedSize + currentSequenceItemSize < contextSize[direction === 0 ? 1 : 0]) {
                 if (currentSequenceItemSize > maxSequenceItemSize) maxSequenceItemSize = currentSequenceItemSize;
                _addToView.call(this,currentView, accumulatedSize === 0 ? accumulatedSize : (accumulatedSize + spacingBetweenItems[rowNumber][0] * (rowNumberCounter === spacingBetweenItems[rowNumber][1] ? rowNumberCounter : rowNumberCounter++)), sequenceItem);
                accumulatedSize += currentSequenceItemSize;
            } else {
                // result array is populated enough
                currentView.setOptions({size: direction === 1 ? [undefined, maxSequenceItemSize] : [maxSequenceItemSize, undefined]});
                result.push(currentView);
                // reset
                rowNumberCounter = 1;
                accumulatedSize = 0;
                currentView = new View();

                _addToView.call(this, currentView, accumulatedSize === 0 ? accumulatedSize : accumulatedSize + spacingBetweenItems[rowNumber++], sequenceItem);
                accumulatedSize += currentSequenceItemSize;

            }

                // remnant items in currentView
            if (j === this._originalArray.length - 1) {
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

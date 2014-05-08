/*globals define*/
define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');
    var ViewSequence = require('famous/core/ViewSequence');
    var Utility = require('famous/utilities/Utility');
    var Timer = require('famous/utilities/Timer');
    var TransitionableTransform = require('famous/transitions/TransitionableTransform');

    /*
     * @name reflowableScrollview
     * @constructor
     * @description
     */

    function reflowableScrollview (options) {
        ScrollView.apply(this, arguments);
        this.setOptions(reflowableScrollview.DEFAULT_OPTIONS);
        this.setOptions(options);
        this.debounceFlag = true;
        this._previousSize = [undefined, undefined];
        this._scroller.commit = _customCommit.bind(this);
        this._previousTranslationObject = [];
        this._currentTranslationObject = [];
        this._result = [];
    }

    reflowableScrollview.prototype = Object.create(ScrollView.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    reflowableScrollview.DEFAULT_OPTIONS = {
    };

    function _customCommit(context) {
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

            this._previousTranslationObject = this._currentTranslationObject;

            if (!this.debounceFlag) {
                var _timeDebouncedCreateNewViewSequence = Timer.debounce(_createNewViewSequence,1000);
                _timeDebouncedCreateNewViewSequence.call(this, context);
            }

            if (this.debounceFlag) {
                _createNewViewSequence.call(this, context);
                this.debounceFlag = false;
            }



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
    }

    function _createNewViewSequence(context) {
        // 'this' will be an instance of reflowableScrollview
        this._originalArray = this._originalArray || this._node._.array;

        var direction = this.options.direction;
        var offsetDirection = (direction === 0 ? 1 : 0);
        var contextSize = context.size; // this is an array
        var result = [];

        var currentView = new View();
        var accumulatedSize = 0;
        var maxSequenceItemSize = 0;
        var numSequenceItems = 0;
        var gutterInfo = _calculateGutterInfo.call(null, this._originalArray, direction, contextSize);
        var accumulatedSizeWithGutter;
        var rowNumber = 0;
        var rowNumberCounter = 1;
        var sequenceItem;
        var currentSequenceItemSize;
        var currentSequenceItemMaxSize;
        var translationObject = [];
        var xyCoordinates = [];

        this._transitionableArray = [];

        for (var i = 0; i < this._originalArray.length; i += 1) {
            this._transitionableArray.push(new TransitionableTransform());
        }

        for (var j = 0; j < this._originalArray.length; j += 1) {
            sequenceItem = this._originalArray[j];
            currentSequenceItemSize = sequenceItem.getSize()[offsetDirection];
            currentSequenceItemMaxSize = sequenceItem.getSize()[direction];

            // Check if sum of item sizes is larger than context size
            if (accumulatedSize + currentSequenceItemSize <= contextSize[offsetDirection]) {

                // find max view size
                if (currentSequenceItemMaxSize > maxSequenceItemSize) {
                    maxSequenceItemSize = currentSequenceItemMaxSize;
                }

                // first sequenceItem will be on the left / top most edge
                if (accumulatedSize === 0) {
                    accumulatedSizeWithGutter = accumulatedSize;
                } else {
                    // want to include number of gutters proportional to the number of items in a row
                    accumulatedSizeWithGutter = accumulatedSize + gutterInfo[rowNumber][0] * (rowNumberCounter === gutterInfo[rowNumber][1] ? rowNumberCounter : rowNumberCounter++);
                }

                // collect xyCoordinates of each item
                xyCoordinates.push([accumulatedSizeWithGutter]);

                _addToView.call(this, currentView, accumulatedSizeWithGutter, sequenceItem, j);
                accumulatedSize += currentSequenceItemSize;
            } else {
                // result array is populated enough
                currentView.setOptions({ size: direction === 1 ? [undefined, maxSequenceItemSize] : [maxSequenceItemSize, undefined] });
                result.push(currentView);

                // add max view size to each xyCoordinates subarray
                xyCoordinates.forEach(function(array) {
                    var element = {};
                    element['position'] = (direction === 1 ? [array[0],maxSequenceItemSize]: [maxSequenceItemSize, array[0]]);
                    element['row'] = rowNumber;
                    // element['transitionable'] = new TransitionableTransform();
                    translationObject.push(element);
                });

                // reset
                rowNumber += 1; // make sure we're increasing rowNumber so that we're grabbing correct info from gutterInfo
                rowNumberCounter = 1;
                accumulatedSize = 0;
                maxSequenceItemSize = 0;
                currentView = new View();
                xyCoordinates = [];

                // for first item in each row:
                currentSequenceItemMaxSize = sequenceItem.getSize()[direction];

                if (currentSequenceItemMaxSize > maxSequenceItemSize) {
                    maxSequenceItemSize = currentSequenceItemMaxSize;
                }

                xyCoordinates.push([accumulatedSize]);
                _addToView.call(this, currentView, accumulatedSize, sequenceItem, j);
                accumulatedSize += currentSequenceItemSize;
            }

                // remnant items in currentView
            if (j === this._originalArray.length - 1) {
                currentView.setOptions({ size: direction === 1 ? [undefined, maxSequenceItemSize] : [maxSequenceItemSize, undefined] });
                result.push(currentView);
                xyCoordinates.forEach(function(array) {
                    var element = {};
                    element['position'] = (direction === 1 ? [array[0],maxSequenceItemSize]: [maxSequenceItemSize, array[0]]);
                    element['row'] = rowNumber;
                    // element['transitionable'] = new TransitionableTransform();
                    translationObject.push(element);
                });
            }
        }
        // console.log('translationObject ', translationObject);
        this._currentTranslationObject = translationObject;

        for (var i = 0; i < this._currentTranslationObject.length; i += 1) {
            var prevTransObj = this._previousTranslationObject[i] || {position: [0,0], row: 0};
            // if (this._previousTranslationObject === null) {
            //     this._previousTranslationObject = this._currentTranslationObject;
            //     this._previousTranslationObject[i] = { position: [0, 0], row: 0 };
            // }
            this._result[i] = _getPreviousPosition.call(this, prevTransObj, this._currentTranslationObject[i]);
            this._transitionableArray[i].setTranslate([-this._result[i][12], -this._result[i][13] , -this._result[i][14]], {duration: 3000, curve: 'easeInOut'});
        }

        this.sequenceFrom.call(this, result);
        // return result;
    }

    function _addToView(view, offset, sequenceItem, idx) {
        // var transitionable;
        var modifier = new Modifier({
            transform: function () { return _customFunction.call(this, offset, idx) }.bind(this)
        });
        view.add(modifier).add(sequenceItem);
    }

    function _customFunction(offset, idx) {
        var fromOrig = this._result[idx];
        var toNew = this._transitionableArray[idx].get();
        return Transform.multiply(fromOrig, toNew);
    }

    // _getPreviousPosition.call(this, previousObj, currentObj) - where 'this' is an instance of reflowable scrollview
    function _getPreviousPosition(previousObj, currentObj) {
        var direction = this.options.direction;
        var offsetDirection = (direction === 0 ? 1 : 0);

        var positionTransform = Transform.identity;
        var rowTransform = Transform.identity;

        // element['position'] = [array[0],maxSequenceItemSize] OR [maxSequenceItemSize, array[0]];
        // element['row'] = rowNumber;

        // if scrolling along Y:
        var currentPosition = currentObj.position[offsetDirection];
        var previousPosition = previousObj.position[offsetDirection];
        var currentMax = currentObj.position[direction];
        var previousMax = previousObj.position[direction];
        var currentRow = currentObj.row;
        var previousRow = previousObj.row;

        if (currentPosition > previousPosition) {
            positionTransform = Transform.translate(-(currentPosition - previousPosition), 0, 0);
        }
        else if (previousPosition > currentPosition) {
            positionTransform = Transform.translate(previousPosition - currentPosition, 0, 0);   
        }

        // calculate the row data separately, cannot be part of the same if/else chain
        if (currentRow > previousRow) {
            rowTransform = Transform.translate(0, -previousMax, 0);
        }
        else if (previousRow > currentRow) {
            rowTransform = Transform.translate(0, currentMax, 0);
        }

        return Transform.multiply(positionTransform, rowTransform);
    }

    function _calculateGutterInfo(sequenceItems, direction, contextSize) {
        // 'this' will be an instance of reflowableScrollview
        // _calculateGetter.call(this, this._originalArray, direction)

        var offsetDirection = (direction === 0 ? 1 : 0);
        var accumulatedSize = 0;
        var numSequenceItems = 0;
        var gutterInfo = [];
        var totalGutter;
        var sequenceItem;
        var currentSequenceItemSize;


        for (var i = 0; i < sequenceItems.length; i += 1) {
            sequenceItem = sequenceItems[i];
            currentSequenceItemSize = sequenceItem.getSize()[offsetDirection];

            if (accumulatedSize + currentSequenceItemSize <= contextSize[offsetDirection]) {
                accumulatedSize += currentSequenceItemSize;
                numSequenceItems += 1;

                // last item in sequenceItems
                if (i === sequenceItems.length - 1) {
                    totalGutter = contextSize[offsetDirection] - accumulatedSize;
                    gutterInfo.push( [Math.floor(totalGutter / (numSequenceItems - 1)), numSequenceItems] );
                }
            } else {
                totalGutter = contextSize[offsetDirection] - accumulatedSize;
                gutterInfo.push( [Math.floor(totalGutter / (numSequenceItems - 1)), numSequenceItems] );

                // reset
                accumulatedSize = 0;
                numSequenceItems = 0;

                accumulatedSize += currentSequenceItemSize;
                numSequenceItems += 1;
            }
        }

        return gutterInfo; // [[total gutter / number of items, number of items]] => one inner array for each row
    }

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

/* animation bug log: 
  1. cannot animate diagonally if there are more than a difference of one row. e.g: 
    Row 0  ->   Row 2
    How do you know how much distance is between them?
      SOLUTION: keep track of previous row max sizes;

  2. DONE: customCommit now calls just once
  3. 
*/
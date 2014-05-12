// globals define //
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
    var Easing = require('famous/transitions/Easing');

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
        this._scroller.commit = _customCommit.bind(this);
        this._previousTranslationObject = [];
        this._currentTranslationObject = [];
        this._result = [];
        this._timer = true;
    }

    reflowableScrollview.prototype = Object.create(ScrollView.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    reflowableScrollview.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y,
        duration: 1000,
        curve: 'linear',
        debounceTimer: 1000,
        gutter: false,
        defaultZ: 0
    };

    /*
      _customCommit inherits most of its logic and code from Scroller's commit method, but allows
      us to intercept and replace the original viewSequence before .render() is called.
      This is because Scrollview lays out its renderables using a ViewSequence (like a linked-list), 
      so a new ViewSequence has to be constructed each time there is a resizing event. 
     * @private
??   * @method commit 
     * @param {Context} context commit context
    */
    function _customCommit(context) {
        // To avoid mixing context, 'this' will always be an instance of reflowableScrollview
        var _scroller = this._scroller;

        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;

        // reset edge detection on size change
        if (!_scroller.options.clipSize && (size[0] !== _scroller._contextSize[0] || size[1] !== _scroller._contextSize[1])) {
            _scroller._onEdge = 0;
            _scroller._contextSize[0] = size[0];
            _scroller._contextSize[1] = size[1];

            if (_scroller.options.direction === Utility.Direction.X) {
                _scroller._size[0] = _getClipSize.call(_scroller);
                _scroller._size[1] = undefined;
            }
            else {
                _scroller._size[0] = undefined;
                _scroller._size[1] = _getClipSize.call(_scroller);
            }

            // begin custom code extending scroller's commit function
            this._previousTranslationObject = this._currentTranslationObject;

            // first time execution of this reflowable scroll view, the following gets run only once
            if (this.debounceFlag) {
                initTransitionables.call(this); // initialize an array of TransitionableTransforms
                _createNewViewSequence.call(this, context);
                this.debounceFlag = false;
            }

            // new view sequence gets generated upon resizing event
            if (!this.debounceFlag && this._timer) {
                var _timeDebouncedCreateNewViewSequence = Timer.debounce(_createNewViewSequence, this.options.debounceTimer);
                _timeDebouncedCreateNewViewSequence.call(this, context);
                this._timer = false;
            }
            // end custom code
        }

        var scrollTransform = _scroller._masterOutputFunction(-_scroller._position);

        return {
            transform: Transform.multiply(transform, scrollTransform),
            opacity: opacity,
            origin: origin,
            target: _scroller.group.render()
        };
    }

    /*
    * Creates one transitionableTransform for every view or surface that is 
    passed in via ReflowableScrollview's sequenceFrom method, and is accessible in 
    this._transitionableArray. 
    */
    function initTransitionables () {
        this._transitionableArray = [];
        for (var i = 0; i < this._node._.array.length; i += 1) {
            this._transitionableArray.push(new TransitionableTransform());
        }
    }

    /*

    */
    function _createNewViewSequence(context) {
        // 'this' will be an instance of reflowableScrollview
        this._originalArray = this._originalArray || this._node._.array;

        var direction = this.options.direction;
        var offsetDirection = (direction === 0 ? 1 : 0);
        var contextSize = context.size; // this is an array
        var result = [];
        var accumulate = {};
        accumulate.accumulatedSize = 0;
        accumulate.rowNumber = 0;
        accumulate.rowNumberCounter = 1;

        var currentView = new View();
        var maxSequenceItemSize = 0;
        var numSequenceItems = 0;
        var gutterInfo = _calculateGutterInfo.call(null, this._originalArray, direction, contextSize);
        var accumulatedSizeWithGutter;
        var sequenceItem;
        var currentSequenceItemSize;
        var currentSequenceItemMaxSize;
        var translationObject = [];
        var xyCoordinates = [];

        for (var j = 0; j < this._originalArray.length; j += 1) {
            sequenceItem = this._originalArray[j];
            currentSequenceItemSize = sequenceItem.getSize()[offsetDirection];
            currentSequenceItemMaxSize = sequenceItem.getSize()[direction];

            // Check if sum of item sizes is larger than context size
            if (accumulate.accumulatedSize + currentSequenceItemSize <= contextSize[offsetDirection]) {

                // find max view size
                if (currentSequenceItemMaxSize > maxSequenceItemSize) {
                    maxSequenceItemSize = currentSequenceItemMaxSize;
                }

                // first sequenceItem will be on the left / top most edge
                accumulatedSizeWithGutter = _gutter.call(this, accumulate);

                // collect xyCoordinates of each item
                xyCoordinates.push([accumulatedSizeWithGutter]);

                _addToView.call(this, currentView, accumulatedSizeWithGutter, sequenceItem, j);
                accumulate.accumulatedSize += currentSequenceItemSize;
            } else {
                // result array is populated enough
                currentView.setOptions({ size: direction === 1 ? [undefined, maxSequenceItemSize, this.options.defaultZ] : [maxSequenceItemSize, undefined, this.options.defaultZ] });
                result.push(currentView);

                // add max view size to each xyCoordinates subarray
                _createXYCoordinates.call(this, xyCoordinates, maxSequenceItemSize, accumulate.rowNumber, translationObject);

                // reset
                accumulate.rowNumber += 1; // make sure we're increasing accumulate.rowNumber so that we're grabbing correct info from gutterInfo
                accumulate.rowNumberCounter = 1;
                accumulate.accumulatedSize = 0;
                maxSequenceItemSize = 0;
                currentView = new View();
                xyCoordinates = [];

                // for first item in each row:
                currentSequenceItemMaxSize = sequenceItem.getSize()[direction];

                if (currentSequenceItemMaxSize > maxSequenceItemSize) {
                    maxSequenceItemSize = currentSequenceItemMaxSize;
                }

                xyCoordinates.push([accumulate.accumulatedSize]);
                _addToView.call(this, currentView, accumulate.accumulatedSize, sequenceItem, j);
                accumulate.accumulatedSize += currentSequenceItemSize;
            }

            // remnant items in currentView
            if (j === this._originalArray.length - 1) {
                currentView.setOptions({ size: direction === 1 ? [undefined, maxSequenceItemSize, this.options.defaultZ] : [maxSequenceItemSize, undefined, this.options.defaultZ] });
                result.push(currentView);
                _createXYCoordinates.call(this, xyCoordinates, maxSequenceItemSize, accumulate.rowNumber, translationObject);
            }
        }

        // console.log('translationObject ', translationObject);
        this._currentTranslationObject = translationObject;

        setTransitionables.call(this, this._currentTranslationObject, this._previousTranslationObject, this._transitionableArray);

        this.sequenceFrom.call(this, result);
        this._timer = true;
        // return result;
    }

    /*

    */
    function _gutter (accumulate) {
        if (accumulate.accumulatedSize === 0) {
            return accumulate.accumulatedSize;
        } else if (this.options.gutter) {
            var t = accumulate.rowNumberCounter === gutterInfo[accumulate.rowNumber][1] ? accumulate.rowNumberCounter : accumulate.rowNumberCounter++;
            return accumulate.accumulatedSize + gutterInfo[accumulate.rowNumber][0] * t;
            // want to include number of gutters proportional to the number of items in a row
            // accumulatedSizeWithGutter = this.options.gutter ? accumulatedSizeWithGutter = accumulate.accumulatedSize + gutterInfo[accumulate.rowNumber][0] * (accumulate.rowNumberCounter === gutterInfo[accumulate.rowNumber][1] ? accumulate.rowNumberCounter : accumulate.rowNumberCounter++): accumulate.accumulatedSize;

        } else {
            return accumulate.accumulatedSize;
        }
    }

    function _createXYCoordinates (xyCoordinates, maxSequenceItemSize, rowNumber, translationObject) {
        var direction = this.options.direction;
        xyCoordinates.forEach(function(array) {
            var element = {};
            element['position'] = (direction === 1 ? [array[0],maxSequenceItemSize, this.options.defaultZ]: [maxSequenceItemSize, array[0], this.options.defaultZ]);
            element['row'] = rowNumber;
            // element['transitionable'] = new TransitionableTransform();
            translationObject.push(element);
        }.bind(this));
    }

    // sets each transitionableTransform in the this._transitionableArray to original position, and animate back to new position
    // returns the newly set transitionable array. This is called once per resizing. 
    function setTransitionables (currTranslationObj, prevTranslationObj, transitionableArray) {
        var defaultPrev = {position: [0,0, this.options.defaultZ], row: 0}

        for (var i = 0; i < currTranslationObj.length; i += 1) {
            // the FIRST TIME this runs, this._previousTranslationObject array will be of length 0; elements undefined. 
            var prevObj = prevTranslationObj[i] || defaultPrev;
            
            this._result[i] = _getPreviousPosition.call(this, prevObj, currTranslationObj[i]);

            // reset
            transitionableArray[i].halt();
            transitionableArray[i].set(this._result[i]);
            // if (i === 3 ) {
            //     i === 3 ? console.log('isActive') : '';
            //     transitionableArray[i].halt();
            //     // 
            //     transitionableArray[i].set(Transform.translate(100, 0, 1), {duration: 1000});
            //     transitionableArray[i].set(Transform.translate(100, 100, 1), {duration: 1000});
            //     transitionableArray[i].set(Transform.translate(0, 100, 1), {duration: 1000});
            //     transitionableArray[i].set(Transform.translate(0, 0, 1), {duration: 1000});

            // } else {
            //     transitionableArray[i].set(this._result[i]);
            // }
            // transitionableArray[i].set(Transform.identity);

            // go to prev

            // animate back to current
            transitionableArray[i].set(Transform.identity, {duration: this.options.duration, curve: this.options.curve});

            // // console log of 3
            i === 3 ? window.prev = prevObj : '';
            i === 3 ? window.curr = currTranslationObj[i] : '';
            i === 3 ? window.res = this._result[i] : '';
            i === 3 ? console.log(window.prev.position, window.curr.position, res, transitionableArray[i].get()) : '';
        }

        return transitionableArray;
    }

    function _addToView(view, offset, sequenceItem, idx) {
        // var transitionable;
        var modifier = new Modifier({
            transform: function () { return _customFunction.call(this, offset, idx) }.bind(this)
        });
        view.add(modifier).add(sequenceItem);
    }

    function _customFunction(offset, idx) {
        var direction = this.options.direction;
        var offsetDirection = direction === 0 ? 1 : 0;
        var vector = [0, 0, 0];
        vector[offsetDirection] = offset; 
        var off = Transform.translate.apply(null, vector);
        var trans = this._transitionableArray[idx].get();
        var orig = Transform.multiply(off, trans);

        return orig;
    }
     // * @param {Object} [options] default option overrides
     // * @param {Array.Number} [options.size] [width, height] in pixels
     // * @param {Array.string} [options.classes] CSS classes to set on inner content
     // * @param {Array} [options.properties] string dictionary of HTML attributes to set on target div
     // * @param {string} [options.content] inner (HTML) content of surface

    /*
      _getPreviousPosition 

      @param {Object} []
      @param {Object}
      @return {Transform} the result matrix to get back to the previous position

    */
    function _getPreviousPosition(previousObj, currentObj) {
        var direction = this.options.direction;
        var offsetDirection = (direction === 0 ? 1 : 0);

        var positionTransform = Transform.identity;
        var rowTransform = Transform.identity;

        // element['position'] = [array[0],maxSequenceItemSize] OR [maxSequenceItemSize, array[0]];
        // element['row'] = accumulate.rowNumber;

        var currentPosition = currentObj.position[offsetDirection];
        var previousPosition = previousObj.position[offsetDirection];
        var currentMax = currentObj.position[direction];
        var previousMax = previousObj.position[direction];
        var currentRow = currentObj.row;
        var previousRow = previousObj.row;

        var vectorPos = [0, 0, 0];
        if (currentPosition > previousPosition) {
            vectorPos[offsetDirection] = -(currentPosition - previousPosition);
            positionTransform = Transform.translate.apply(null, vectorPos);
        }
        else if (previousPosition > currentPosition) {
            vectorPos[offsetDirection] = previousPosition - currentPosition;
            positionTransform = Transform.translate.apply(null, vectorPos);
        }

        // calculate the row data separately, cannot be part of the same if/else chain
        var vectorRow = [0, 0, 0];
        if (currentRow > previousRow) {
            vectorRow[direction] = -previousMax;
            rowTransform = Transform.translate.apply(null, vectorRow);
        }
        else if (previousRow > currentRow) {
            vectorRow[direction] = currentMax;
            rowTransform = Transform.translate.apply(null, vectorRow);
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
        window.g = gutterInfo;

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

/*

  Animation bug: 
  - IF resizing WHILE there's an animation resize, the items jump to end position, then moves to the new position. 

*/

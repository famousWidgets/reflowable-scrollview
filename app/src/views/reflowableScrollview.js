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

    /**
     * ReflowableScrollview extends Scrollview and adds functionality that 
     *   reflows the renderables on screen whenever there is a resize event
     * @name reflowableScrollview
     * @constructor
     * @param {Options} [options] An object of configurable options
     * @param {Number} [options.direction=Utility.Direction.Y] Using the direction helper found in the famous Utility
     * module, this option will lay out the Scrollview instance's renderables either horizontally
     * (x) or vertically (y). Utility's direction is essentially either zero (X) or one (Y), so feel free
     * to just use integers as well.
     * @param {Number} [duration=1000] represents length of time for reflowable animation
     * @param {String} [curve='linear'] easing curve for the reflowable animation 
     * @param {Number} [debounceTimer=1000] amount of time delayed before triggering reflowable animation after resize
     * @param {Boolean} [gutter=false] whether a gutter should appear between each renderable
     */

    function reflowableScrollview (options) {
        ScrollView.apply(this, arguments);
        this.setOptions(reflowableScrollview.DEFAULT_OPTIONS);
        this.setOptions(options);

        this._scroller.commit = _customCommit.bind(this);
        this._previousTranslationObject = [];
        this._currentTranslationObject = [];
        this._result = [];
        this._debounceFlag = true;
        this._timer = true;
    }

    reflowableScrollview.prototype = Object.create(ScrollView.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    reflowableScrollview.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y,
        duration: 1000,
        curve: 'linear',
        debounceTimer: 1000,
        gutter: false
    };

    /**
     * _customCommit inherits most of its logic and code from Scroller's commit method, but allows
     * us to intercept and replace the original viewSequence before .render() is called.
     * This is because Scrollview lays out its renderables using a ViewSequence (like a linked-list), 
     * so a new ViewSequence has to be constructed each time there is a resizing event. 
     * @private
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

            // begin custom code extending scroller's commit function
            this._previousTranslationObject = this._currentTranslationObject;

            // new view sequence gets generated upon resizing event
            if (!this._debounceFlag && this._timer) {
                var _timeDebouncedCreateNewViewSequence = Timer.debounce(_createNewViewSequence, this.options.debounceTimer);
                _timeDebouncedCreateNewViewSequence.call(this, context);
                this._timer = false;
            }

            // first time execution of this reflowable scroll view, the following gets run only once
            if (this._debounceFlag) {
                _initTransitionables.call(this); // initialize an array of TransitionableTransforms
                _createNewViewSequence.call(this, context);
                this._debounceFlag = false;
            }
            // end custom code

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

    /**
     * Creates one transitionableTransform for every view or surface that is 
     * passed in via ReflowableScrollview's sequenceFrom method, and is accessible in 
     * this._transitionableArray.
     * @private
     */
    function _initTransitionables () {
        this._transitionableArray = [];
        for (var i = 0; i < this._node._.array.length; i += 1) {
            this._transitionableArray.push(new TransitionableTransform());
        }
    }

    /**
     * Intercepts the array of renderables that gets passed in by the user and 
     * creates a new ViewSequence to pass to Scrollview's sequenceFrom method.
     * New viewSequence nodes are composed of new views with positions based on 
     * whether a user decides to include gutters or not.
     * Associated transitionableTransforms are also reset and set to animate to new positions.
     * @private
     * @param {Context} context commit context
     */
    function _createNewViewSequence(context) {
        // 'this' will be an instance of reflowableScrollview
        this._originalArray = this._originalArray || this._node._.array;

        var direction = this.options.direction;
        var offsetDirection = (direction === 0 ? 1 : 0);
        var contextSize = context.size;
        var result = [];

        // helper object for calculating offset for each new view 
        var currentView = new View();
        var accumulate = {};
        accumulate.accumulatedSize = 0;
        accumulate.rowNumber = 0;
        accumulate.rowNumberCounter = 1;

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

                // create new views within reflowable where each view corresponds to a row or column
                _addToView.call(this, currentView, accumulatedSizeWithGutter, sequenceItem, j);

                accumulate.accumulatedSize += currentSequenceItemSize;
            } else {

                // at this point, no more renderables can be added to the currentView without overflowing
                currentView.setOptions({ size: direction === 1 ? [undefined, maxSequenceItemSize] : [maxSequenceItemSize, undefined] });
                result.push(currentView);

                // add max view size to each xyCoordinates subarray
                _createXYCoordinates.call(this, xyCoordinates, maxSequenceItemSize, accumulate.rowNumber, translationObject);

                // reset configurations for each new view in the viewSequence
                accumulate.rowNumber += 1;
                accumulate.rowNumberCounter = 1;
                accumulate.accumulatedSize = 0;
                maxSequenceItemSize = 0;
                currentView = new View();
                xyCoordinates = [];

                // the current sequenceItem is part of the next view:
                currentSequenceItemMaxSize = sequenceItem.getSize()[direction];

                if (currentSequenceItemMaxSize > maxSequenceItemSize) {
                    maxSequenceItemSize = currentSequenceItemMaxSize;
                }

                xyCoordinates.push([accumulate.accumulatedSize]);
                _addToView.call(this, currentView, accumulate.accumulatedSize, sequenceItem, j);
                accumulate.accumulatedSize += currentSequenceItemSize;
            }

            // for the last view in the viewSequence, there may be less items than the other views
            if (j === this._originalArray.length - 1) {
                currentView.setOptions({ size: direction === 1 ? [undefined, maxSequenceItemSize] : [maxSequenceItemSize, undefined] });
                result.push(currentView);
                _createXYCoordinates.call(this, xyCoordinates, maxSequenceItemSize, accumulate.rowNumber, translationObject);
            }
        }

        this._currentTranslationObject = translationObject;

        // transitionableTransform animations are reset, and animated to new positions relative to their previous positions
        setTransitionables.call(this, this._currentTranslationObject, this._previousTranslationObject, this._transitionableArray);

        this.sequenceFrom.call(this, result);
        this._timer = true;
    }

    /**
     * Helper function to for adding gutter offsets to each sequenceItem in the view
     * @private
     * @param {Object} helper object for calculating offset for each new view
     * @return {Number} the offset for each sequenceItem with or without gutter
     */
    function _gutter (accumulate) {
        if (accumulate.accumulatedSize === 0) {
            return accumulate.accumulatedSize;
        } else if (this.options.gutter) {
            var t = accumulate.rowNumberCounter === gutterInfo[accumulate.rowNumber][1] ? accumulate.rowNumberCounter : accumulate.rowNumberCounter++;
            return accumulate.accumulatedSize + gutterInfo[accumulate.rowNumber][0] * t;
        } else {
            return accumulate.accumulatedSize;
        }
    }

    /**
     * Helper function for populating xyCoordinates with information about each view, 
     * including the view's position and the index of the view within the viewSequence
     * @private
     * @param {Array}  An array of arrays where each inner array has the accumulated size with gutter
     * @param {Number} the largest dimension for this view (used for offset in scroller.innerRender)
     * @param {Number} the index of the view within the viewSequence
     * @param {Array}  the translationObject accumulates current positions and current rows, which gets used by setTransitionables() 
     */
    function _createXYCoordinates (xyCoordinates, maxSequenceItemSize, rowNumber, translationObject) {
        var direction = this.options.direction;
        xyCoordinates.forEach(function(array) {
            var element = {};
            element.position = (direction === 1 ? [array[0],maxSequenceItemSize]: [maxSequenceItemSize, array[0]]);
            element.row = rowNumber;
            translationObject.push(element);
        }.bind(this));
    }

    /**
     * This function is called once per resizing, and sets each transitionableTransform in the this._transitionableArray to the previous position, 
     * and animate back to new position
     * returns the newly set transitionable array. This is called once per resizing.
     * @param {Array} currTranslationObj An array of objects which contain current position and row information for each of the original renderables
     * @param {Array} prevTranslationObj An array of objects which contain previous position and row information for each of the original renderables
     * @param {Array} transitionableArray An array of transitionableTransforms for each of the original renderables 
     * @return {Array} transitionableArray An array of transitionableTransforms for each of the original renderables
     */
    function setTransitionables (currTranslationObj, prevTranslationObj, transitionableArray) {
        var defaultPrev = {position: [0,0], row: 0};

        for (var i = 0; i < currTranslationObj.length; i += 1) {
            var prevObj = prevTranslationObj[i] || defaultPrev;
            
            this._result[i] = _getPreviousPosition.call(this, prevObj, currTranslationObj[i]);

            // reset
            transitionableArray[i].halt();

            // go to prev
            transitionableArray[i].set(this._result[i]);

            // animate back to current
            transitionableArray[i].set(Transform.identity, {duration: this.options.duration, curve: this.options.curve});
        }

        return transitionableArray;
    }

    function _addToView(view, offset, sequenceItem, idx) {
        var modifier = new Modifier({
            transform: function () { return _transformToNew.call(this, offset, idx); }.bind(this)
        });
        view.add(modifier).add(sequenceItem);
    }

    /**
     * Returns a transformation matrix that represents a slice of the transitionableTransform 
     * moving towards the current position from the previous position
     * @param {Number} offset Amount of translation in the x and y direction for each renderable
     * @param {Number} idx The current renderable to apply translations to
     * @return {Transform} a transformation matrix 
     */
    function _transformToNew(offset, idx) {
        var direction = this.options.direction;
        var offsetDirection = direction === 0 ? 1 : 0;

        var vector = [0, 0, 0];
        vector[offsetDirection] = offset; 
        var off = Transform.translate.apply(null, vector);
        var trans = this._transitionableArray[idx].get();
        var orig = Transform.multiply(off, trans);

        return orig;
    }

    /**
     * Helper function to return a transformation matrix representing the previous position 
     * @param {Object} previousObj has two properties: position and row. position is a translation vector [x, y, z], row is the index of the current view in the viewSequence 
     * @param {Object} currentObj has two properties: position and row. position is a translation vector [x, y, z], row is the index of the current view in the viewSequence 
     * @return {Transform} the result transformation matrix to get back to the previous position
     */
    function _getPreviousPosition(previousObj, currentObj) {
        // _getPreviousPosition.call(this, previousObj, currentObj) - where 'this' is an instance of reflowable scrollview
        var direction = this.options.direction;
        var offsetDirection = (direction === 0 ? 1 : 0);

        var positionTransform = Transform.identity;
        var rowTransform = Transform.identity;

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

    /**
     * Helper function to return an array of arrays where each inner array contains 2 elements.
     * The first element represents the total gutter size in between each sequenceItem for a particular view.
     * The second element reprsents the total number of sequenceItems for a particular view.
     * @param {Array} sequenceItems represents a collection of renderables that the user passes in
     * @param {Number} direction X or Y scrolling
     * @param {Array} contextSize An array representing the width and height of window
     * @return {Array} returns an array of arrays
     */
    function _calculateGutterInfo(sequenceItems, direction, contextSize) {
        // 'this' will be an instance of reflowableScrollview

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

                // for the last view in the viewSequence, there may be less items than the other views
                if (i === sequenceItems.length - 1) {
                    totalGutter = contextSize[offsetDirection] - accumulatedSize;
                    gutterInfo.push( [Math.floor(totalGutter / (numSequenceItems - 1)), numSequenceItems] );
                }
            } 
            else {
                totalGutter = contextSize[offsetDirection] - accumulatedSize;
                gutterInfo.push( [Math.floor(totalGutter / (numSequenceItems - 1)), numSequenceItems] );

                // reset configurations for each new view in the viewSequence
                accumulatedSize = 0;
                numSequenceItems = 0;
                accumulatedSize += currentSequenceItemSize;
                numSequenceItems += 1;
            }
        }

        return gutterInfo; // [[total gutter / (number of items - 1), number of items]] 
    }

    // copied over from Scroller
    function _sizeForDir(size) {
        if (!size) size = this._contextSize;
        var dimension = (this.options.direction === Utility.Direction.X) ? 0 : 1;
        return (size[dimension] === undefined) ? this._contextSize[dimension] : size[dimension];
    }

    // copied over from Scroller
    function _getClipSize() {
        if (this.options.clipSize) return this.options.clipSize;
        else return _sizeForDir.call(this, this._contextSize);
    }

    module.exports = reflowableScrollview;
});

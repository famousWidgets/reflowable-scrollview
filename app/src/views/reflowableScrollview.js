/*globals define*/
define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');
    var ViewSequence = require('famous/core/ViewSequence');

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

        // console.log("scroller:", this._scroller);
        // this._scroller.commit = (function () {
        //     console.log(this);
        //     commit.call(this, this._node);
        // }).bind(this);
    }

    reflowableScrollview.prototype = Object.create(ScrollView.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    // reflowableScrollview.prototype.sequenceFrom = function sequenceFrom(node) {
    //     var _scroller = this;
    //     if (node instanceof Array) node = new ViewSequence({array: node});
    //     _scroller._node = node;
    //     _scroller._positionOffset = 0;
    //     console.log('Inside scroller');
    // };

    var _customCommit = function (context) {
        // 'this' will be an instance of reflowableScrollview
        
        // create a new ViewSequence
        _createNewViewSequence.call(this);

        // var originalArray = this._node._.array;
        // this.sequenceFrom(newArray);
        // console.log('Inside commit');
        // console.log('Context is: ', context);

        var _scroller = this._scroller;

        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;

        // reset edge detection on size change
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

    var _createNewViewSequence = function () {
        // 'this' will be an instance of reflowableScrollview
        this._originalArray = this._node._.array;
        
    };

    reflowableScrollview.DEFAULT_OPTIONS = {
    };

    module.exports = reflowableScrollview;
});

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

        console.log("scroller:", this._scroller);
    }

    reflowableScrollview.prototype = Object.create(ScrollView.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    reflowableScrollview.DEFAULT_OPTIONS = {
    };

    module.exports = reflowableScrollview;
});

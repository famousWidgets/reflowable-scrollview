/*globals define*/
define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    /*
     * @name reflowableScrollview
     * @constructor
     * @description
     */

    function reflowableScrollview() {
        View.apply(this, arguments);
    }

    reflowableScrollview.prototype = Object.create(View.prototype);
    reflowableScrollview.prototype.constructor = reflowableScrollview;

    reflowableScrollview.DEFAULT_OPTIONS = {
    };

    module.exports = reflowableScrollview;
});

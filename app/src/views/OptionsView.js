
/*globals define*/
define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    /*
     * @name OptionsView
     * @constructor
     * @description
     */

    function OptionsView() {
        View.apply(this, arguments);
        this.createSurfaces.call(this);
        this._setListeners.call(this);
    }

    OptionsView.prototype = Object.create(View.prototype);
    OptionsView.prototype.constructor = OptionsView;

    OptionsView.DEFAULT_OPTIONS = {
    };
    OptionsView.prototype.createSurfaces = function() {
        var surfaceMain = new Surface({
            size: [undefined, 200],
            content: 'hello',
            properties: {
                backgroundColor: 'gray',
                opacity: 0.5
            }
        });
        this.gutterButton = new Surface({
            size: [100,100],
            content: 'give me gutter',
            properties: {
                backgroundColor: 'green'
            }
        })
        var gutterButtonModifier = new StateModifier({
            origin: [0., 0]
        })
        this.directionButton = new Surface({
            size: [100,100],
            content: 'direction me',
            properties: {
                backgroundColor: 'blue'
            }
        })
        var directionButtonModifier = new StateModifier({
            origin: [0, 1]
        })
        this.curveButton = new Surface({
            size: [100,100],
            content: 'curve me',
            properties: {
                backgroundColor: 'orange'
            }
        })
        var curveButtonModifier = new StateModifier({
            origin: [1, 0]
        })
        this.speedButton = new Surface({
            size: [100,100],
            content: 'speed me',
            properties: {
                backgroundColor: 'yellow'
            }
        })
        this.animateButton = new Surface({
            size: [100,100],
            content: 'animate me',
            properties: {
                backgroundColor: 'brown'
            }
        })
        var animateButtonModifier = new StateModifier({
            origin: [0.5, 1]
        })
        var speedButtonModifier = new StateModifier({
            origin: [1, 1]
        })
        var main = this.add(surfaceMain);
        this.add(gutterButtonModifier).add(this.gutterButton);
        this.add(directionButtonModifier).add(this.directionButton);
        this.add(curveButtonModifier).add(this.curveButton);
        this.add(speedButtonModifier).add(this.speedButton);
        this.add(animateButtonModifier).add(this.animateButton);
    };

        // direction: Utility.Direction.Y,
        // curve: Easing.inOutcurve,
        // duration: 200,
        // decurveTimer: 2000
        // gutter: false

    OptionsView.prototype._setListeners = function() {
        this.gutterButton.on('click', function() {
            this._eventOutput.emit('gutter');
        }.bind(this));
        this.directionButton.on('click', function() {
            this._eventOutput.emit('direction');
        }.bind(this));
        this.curveButton.on('click', function() {
            this._eventOutput.emit('curve');
        }.bind(this));
        this.speedButton.on('click', function() {
            console.log('fade');
            this._eventOutput.emit('speed me');
        }.bind(this));
        this.animateButton.on('click', function() {
            console.log('fade');
            this._eventOutput.emit('animate');
        }.bind(this));

    };
    module.exports = OptionsView;
});
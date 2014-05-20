
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
            properties: {
                backgroundColor: 'gray',
                opacity: 0.5,
            }
        });
        this.gutterButton = new Surface({
            size: [50,50],
            content: 'give me gutter',
            properties: {
                // backgroundColor: 'green'
            }
        })
        var gutterButtonModifier = new StateModifier({
            origin: [0, 0]
        })
        this.directionButton = new Surface({
            size: [50,50],
            content: 'Dir',
            properties: {
                // backgroundColor: 'blue',
                fontSize: '16px'
            }
        })
        var directionButtonModifier = new StateModifier({
            // origin: [0, 0.25]
            transform: Transform.translate(0, 50, 0)
        })
        this.curveButton = new Surface({
            size: [50,50],
            content: 'Curve',
            properties: {
                // backgroundColor: 'orange',
                fontSize: '16px'
            }
        })
        var curveButtonModifier = new StateModifier({
            // origin: [0, 0.75]
            transform: Transform.translate(0, 50, 0)
        })
        this.speedButton = new Surface({
            size: [50,50],
            content: 'Speed',
            properties: {
                // backgroundColor: 'yellow',
                fontSize: '16px'
            }
        })
        this.animateButton = new Surface({
            size: [50,50],
            content: 'Start',
            properties: {
                // backgroundColor: 'brown',
                fontSize: '16px'
            }
        })
        var animateButtonModifier = new StateModifier({
            origin: [0, 0]
        })
        var speedButtonModifier = new StateModifier({
            // origin: [0, 1]
            transform: Transform.translate(0, 100, 0)
        })

        // stop
        this.stopButton = new Surface({
            size: [50,50],
            content: 'Stop',
            properties: {
                // backgroundColor: 'brown',
                fontSize: '16px'
            }
        })
        var stopButtonModifier = new StateModifier({
            // origin: [0, 0]
            transform: Transform.translate(0, 150, 0)
        })
        //

        var main = this.add(surfaceMain);
// gone        this.add(gutterButtonModifier).add(this.gutterButton);
        // this.add(directionButtonModifier).add(this.directionButton);
        this.add(curveButtonModifier).add(this.curveButton);
        this.add(speedButtonModifier).add(this.speedButton);
        this.add(animateButtonModifier).add(this.animateButton);
        this.add(stopButtonModifier).add(this.stopButton);
    };

        // direction: Utility.Direction.Y,
        // curve: Easing.inOutcurve,
        // duration: 200,
        // decurveTimer: 2000
        // gutter: false

    OptionsView.prototype._setListeners = function() {
// // gone        this.gutterButton.on('click', function() {
//             this._eventOutput.emit('gutter');
//         }.bind(this));
        // this.directionButton.on('click', function() {
        //     this._eventOutput.emit('direction');
        // }.bind(this));
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

        // stop
        this.animateButton.on('click', function() {
            console.log('stop');
            this._eventOutput.emit('stop');
        }.bind(this));

    };
    module.exports = OptionsView;
});
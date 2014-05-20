/*globals define*/
define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ReflowableScrollview = require('views/reflowableScrollview');
    var Utility = require('famous/utilities/Utility');
    var Easing = require('famous/transitions/Easing');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    /*
     * @name AppView
     * @constructor
     * @description
     */

    function AppView() {
        View.apply(this, arguments);
        // createScrollView.call(this);
        createScrollViewFB.call(this);
        _setListeners.call(this);
        this.curveCounter = 0;
        this.curveArray = [Easing.outBounce,Easing.inSine, Easing.inOutExpo];
    }

    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.DEFAULT_OPTIONS = {
    };

    function createScrollView(options) {
        this.reflowable = new ReflowableScrollview({
            gutter: false,
            direction: Utility.Direction.Y,
            animate: false
        });

        var logos = [];
        // var famousLogo;
        // var hackreactorLogo;
        var num = 100;
        var sizeCounter = 1;
        for (var i = 0; i < num; i += 1) {
            // hackreactorLogo = new ImageSurface({
            //     size: [200, 200],
            //     content: '/content/images/hack_reactor.png',
            //     classes: ['backfaceVisibility']
            // });

            var color = "hsl(" + (i * 90 / 15) + ", 80%, 50%)";

            var surface = new Surface({
                size: [100, 100],
                // size: [50 * (sizeCounter % 2 + 1), 50 * (sizeCounter % 4 + 1)],
                content:  '',
                properties: {
                    fontSize: '36pt',
                    color: 'black',
                    backgroundColor: color
                }
            });
            sizeCounter++;
            // reflowable.subscribe(hackreactorLogo);
            // logos.push(hackreactorLogo);
            this.reflowable.subscribe(surface);
            logos.push(surface);
        }
        this.reflowable.sequenceFrom(logos);
        this.add(this.reflowable);
    }

    // creates fb gallery of photos
    function createScrollViewFB(options) {
        this.reflowable = new ReflowableScrollview({
            gutter: false,
            direction: Utility.Direction.Y,
            animate: false
        });

        var fbPics = [];

        var sizeCounter = 1;
        for (var i = 1; i < 48; i += 1) {
            var item = 'fb' + i + '.jpg';
            var link = '<img class="fbpics" width="208" src="../content/facebookPics/' + item + '" style="background-image: url(/content/facebookPics/' + item + ')"' +  '/>';
            var pic = new Surface({
                // content: "<i style="background-image: url(https://scontent-a-sjc.xx.fbcdn.net/hphotos-frc1/l/t1.0-9/p417x417/10169464_10101570704871645_4836953729694999531_n.jpg);" class="uiMediaThumbImg"></i>"
                content: link,
                size: [208, 206]
            });

            this.reflowable.subscribe(pic);
            fbPics.push(pic);
        }

        var mod = new StateModifier({
            transform: Transform.translate(0, 420, 0) 
        });

        this.reflowable.sequenceFrom(fbPics);
        this.add(mod).add(this.reflowable);
    }

    // background color for fb: #e9eaed

    function _setListeners() {

        this._eventInput.on('direction', function() {
            this.reflowable.setOptions({direction: Utility.Direction.X});
        }.bind(this));

        this._eventInput.on('gutter', function() {
            this.reflowable.setOptions({gutter:true});
        }.bind(this));

        this._eventInput.on('curve', function() {
            console.log('curve');

            this.reflowable.setOptions({curve: this.curveArray[this.curveCounter++]});
        }.bind(this));

        this._eventInput.on('speed me', function() {
            console.log('speed');
            this.reflowable.setOptions({duration: 10000});
        }.bind(this));

        this._eventInput.on('animate', function() {
            console.log('speed');
            this.reflowable.setOptions({animate: true});
        }.bind(this));

    }

    module.exports = AppView;
});
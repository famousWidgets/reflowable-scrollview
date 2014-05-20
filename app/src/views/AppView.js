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
        // createScrollViewFB.call(this);
        addReflow.call(this);
        _setListeners.call(this);
        this.curveCounter = 0;
        this.curveArray = [Easing.outBounce,Easing.inSine, Easing.inOutExpo, Easing.inElastic];
        this.clean = clean.bind(this);
        window.clean = clean;

        this.speedArray = [1000, 3000];
        this.speedCounter = 0;
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

    function addReflow () {
        // create a reflowable view
        this.reflowable = new ReflowableScrollview({
            direction: Utility.Direction.Y
        });

        this.fbarr = [];

        // get class 53
        var class_53s = document.getElementsByClassName('_53s');

        for (var i = 0; i < class_53s.length; i++) {
            var el = class_53s[i];

            el.setAttribute('style', 'width=211px');
            var s = new Surface({
                content: el,
                size: [211, 211]
            });

            this.reflowable.subscribe(s);
            this.fbarr.push(s);
        }

        this.reflowable.sequenceFrom(this.fbarr);
        window.sArr = this.fbarr;
        window.reflow = this.reflowable;
    }

    function clean () {
        // cleaning
        var container = document.getElementById('collection_wrapper_2305272732');
        var parent = container.parentNode;
        parent.removeChild(container);

        // add reflowable
        var mod = new StateModifier({
            transform: Transform.translate(0, 420, 0)
        });

        console.log('yes');
        console.log('this: ', this);
        console.log('mod: ', mod);

        this.add(mod).add(this.reflowable);

        console.log('fin');
    }

    function stop () {
        var stopArr = [];
        for (var i = 0; i < this.fbarr.length; i++) {
            var hr = new Surface({
                content: '../content/images/hack_reactor.png',
                size: [206, 206]
            });
            stopArr.push(hr);
        }

        this.fbarr = stopArr;
    }

    console.log('executed');


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


    function _setListeners() {

        this._eventInput.on('direction', function() {
            this.reflowable.setOptions({direction: Utility.Direction.X});
        }.bind(this));

        this._eventInput.on('gutter', function() {
            this.reflowable.setOptions({gutter:true});
        }.bind(this));

        this._eventInput.on('curve', function() {
            console.log('curve');
            var curve = (++this.curveCounter) % 3;
            this.reflowable.setOptions({curve: this.curveArray[this.curveCounter++]});
        }.bind(this));

        this._eventInput.on('speed me', function() {
            console.log('speed');
            var speed = (++this.speedCounter) % 2;
            this.reflowable.setOptions({duration: this.speedArray[this.speedCounter]})
        }.bind(this));

        this._eventInput.on('animate', function() {
            console.log('start animate');
            // this.reflowable.setOptions({animate: true});
            this.clean();
        }.bind(this));

        this._eventInput.on('stop', function () {
            console.log('stop');
            this.reflowable.setOptions({animate: false});
        })

    }

    module.exports = AppView;
});
/* globals define */
define(function(require, exports, module) {
    'use strict';
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ReflowableScrollview = require('views/reflowableScrollview');
    var Utility = require('famous/utilities/Utility');
    var Easing = require('famous/transitions/Easing');

    // your app here
    var reflowable = new ReflowableScrollview({
<<<<<<< HEAD
        direction: Utility.Direction.X
=======
        // direction: Utility.Direction.Y,
        // curve: Easing.inOutBounce,
        // duration: 200,
        // debounceTimer: 2000
        // gutter: false
>>>>>>> 889596194d2e01987ee219a3a954421775500210
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

        var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";

        var surface = new Surface({
            size: [100, 100],
            // size: [50 * (sizeCounter % 2 + 1), 50 * (sizeCounter % 4 + 1)],
            content:  ''+i,
            properties: {
                backgroundColor: color
            }
        });
        sizeCounter++;
        // reflowable.subscribe(hackreactorLogo);
        // logos.push(hackreactorLogo);
        reflowable.subscribe(surface);
        logos.push(surface);
    }

    var mainContext = Engine.createContext();

    reflowable.sequenceFrom(logos);

    // make available on window for testing
    window.reflowable = reflowable;

    mainContext.add(reflowable);

    /* *************************************************************************************** */
    /////////// greg test ///////////////
    // greg test: //
    // var View = require('famous/core/View');
    // var StateModifier = require('famous/modifiers/StateModifier');
    // var TransitionableTransform = require('famous/transitions/TransitionableTransform');
    // var Scrollview = require('famous/views/Scrollview');
    // var Timer = require('famous/utilities/Timer');
    
    // // view gets translated to a certain place
    // var v1 = new View();
    // var v2 = new View();

    // var s1 = new Surface({
    //     size: [100, 100],
    //     properties: {backgroundColor: 'red'}
    // });
    // var s2 = new Surface({
    //     size: [100, 100],
    //     properties: {backgroundColor: 'blue'}
    // });

    // window.s1 = s1;
    // window.s2 = s2;
    // window.Transform = Transform;

    // // // mimic inner render AKA downstream
    // var m1InnerRender = new Modifier({
    //     transform: Transform.translate(0, 200, 0)
    // });

    // // // mimic our Transitionable function. UPSTREAM
    // var customUpstream = new Modifier({
    //     transform: customFunction
    //     // transform: Transform.translate(0, -200, 0)

    // });

    // v1.add(customUpstream).add(s2);          // custom     
    

    // var tt1 = new TransitionableTransform();
    // // var callback = function () {
    // //     console.log('execute');
    // // };

    // tt1.setTranslate([0, 200, 0], {duration: 3000, curve: 'easeInOut'});
    // var func = function () {
    //     tt1.halt();
    //     var prev = tt1.get();
    //     var move = Transform.translate.apply(null, [300, 0, 0]);
    //     var comb = Transform.multiply(prev, move);
    //     tt1.set(comb, {duration: 1000});
    // }
    // var f = Timer.debounce(func, 1000);
    // f();

    // function customFunction () {
    //     var current = tt1.get();
    //     var translateOffset = Transform.translate(0, -200, 0);
    //     return Transform.multiply(current, translateOffset);
        
    // };

    // s2.on('click', function () {
    //     tt1.halt();
    //     var orig = tt1.get();
    //     var trans = [300, 0, 0];
    //     var newPos = Transform.translate.apply(null, trans);
    //     var combined = Transform.multiply(orig, newPos);
    //     tt1.set(combined, {duration: 1000, curve: 'easeInOut'});
    // });


    // mainContext.add(m1InnerRender).add(v1);  // innerREnder, downstream
    // //////// greg END test/////////////

    // test _getPreviousPosition
    var test_getPreviousPosition = function () {
        // function test
        // _getPreviousPosition.call(this, previousObj, currentObj) - where 'this' is an instance of reflowable scrollview
        function _getPreviousPosition(previousObj, currentObj, dir) {
            // var direction = this.options.direction; 
            var direction = dir
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

            if (currentRow > previousRow) {
                rowTransform = Transform.translate(0, -previousMax, 0);
            }
            else if (previousRow > currentRow) {
                rowTransform = Transform.translate(0, currentMax, 0);
            }

            return Transform.multiply(positionTransform, rowTransform);
        }

        // new position is 100 to the right, so returns -100
        var direction = Utility.Direction.Y;
        var prev0 = {position: [0,100], row: 0};
        var curr0 = {position: [100,100], row: 0};
        var r0 = _getPreviousPosition(prev0, curr0, direction);
        console.log('r0: ', r0[12] === -100);

        // new position is 100 to the left, so returns 100
        var direction = Utility.Direction.Y;
        var prev1 = {position: [100,100], row: 0};
        var curr1 = {position: [0,100], row: 0};
        var r1 = _getPreviousPosition(prev1, curr1, direction);
        console.log('r1: ', r1[12] === 100);

        // different rows, right diagonal
        var direction = Utility.Direction.Y;
        var prev2 = {position: [100,100], row: 0};
        var curr2 = {position: [0,100], row: 1};
        var r2 = _getPreviousPosition(prev2, curr2, direction);
        console.log('r2: ', r2[12] === 100, r2[13] === -100);

        // different rows, right diagonal
        var direction = Utility.Direction.Y;
        var prev3 = {position: [0,100], row: 1};
        var curr3 = {position: [100,100], row: 0};
        var r3 = _getPreviousPosition(prev3, curr3, direction);
        console.log('r3: ', r3[12] === -100, r3[13] === 100);

        // different rows, right diagonal
        var direction = Utility.Direction.Y;
        var prev4 = {position: [100,100], row: 1};
        var curr4 = {position: [0,100], row: 0};
        var r4 = _getPreviousPosition(prev4, curr4, direction);
        console.log('r4: ', r4[12] === 100, r4[13] === 100);

        // different rows, right diagonal
        var direction = Utility.Direction.Y;
        var prev5 = {position: [0,100], row: 0};
        var curr5 = {position: [100,100], row: 1};
        var r5 = _getPreviousPosition(prev5, curr5, direction);
        console.log('r5: ', r5[12] === -100, r5[13] === -100);
    };
});

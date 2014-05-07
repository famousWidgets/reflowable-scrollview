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

    // your app here
    var reflowable = new ReflowableScrollview({
        direction: Utility.Direction.Y
    });

    var logos = [];
    // var famousLogo;
    // var hackreactorLogo;
    var num = 50;
    var sizeCounter = 1;
    for (var i = 0; i < num; i += 1) {
        // hackreactorLogo = new ImageSurface({
        //     size: [100, 100],
        //     content: '/content/images/hack_reactor.png',
        //     classes: ['backfaceVisibility']
        // });

        var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";

        var surface = new Surface({
            // size: [100, 100],
            size: [100 * (sizeCounter % 2 + 1), 100 * (sizeCounter % 4 + 1)],
            content: 'i is ' + i,
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

    // /////////// greg test ///////////////
    // // greg test: //
    // var View = require('famous/core/View');
    // var StateModifier = require('famous/modifiers/StateModifier');
    // var TransitionableTransform = require('famous/transitions/TransitionableTransform');
    // var Scrollview = require('famous/views/Scrollview');
    
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

    // function customFunction () {
    //     var current = tt1.get();
    //     var translateOffset = Transform.translate(0, -200, 0);
    //     return Transform.multiply(current, translateOffset);
        
    // };

    // // s2.on('click', function () {
    // //     tt1.halt();
    // //     var orig = tt1.get();
    // //     var trans = [300, 0, 0];
    // //     var newPos = Transform.translate.apply(null, trans);
    // //     var combined = Transform.multiply(orig, newPos);
    // //     tt1.set(combined, {duration: 1000, curve: 'easeInOut'});
    // // });


    // mainContext.add(m1InnerRender).add(v1);  // innerREnder, downstream
    // //////// greg END test/////////////
});

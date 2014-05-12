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

    // DEMO SCENARIOS

    // 1. Baseline - using defaults and same-sized colored surfaces
    var reflowable = new ReflowableScrollview({
<<<<<<< HEAD
        debounceTimer: 2000
    });
    var surfaces = [];
    var num = 100;
    for (var i = 0; i < num; i += 1) {
=======
        direction: Utility.Direction.Y,
        curve: Easing.outBounce,
        duration: 1000,
        debounceTimer: 250,
        defaultZ: 1000
        // gutter: false
    });

    var pics = [];
    // var famousLogo;
    // var starryNight;
    var num = 100;
    var sizeCounter = 1;

    // for starry night, original size is 1920 x 1080
    var xScale = 1; // 1920/1400;
    var yScale = 1; // 1080/800;

    for (var i = 0; i < num; i += 1) {
        // for (var j = 0; j < 10; j+=1) {
        //     var starryNight = new ImageSurface({
        //         size: [100 * xScale, 100 * yScale],
        //         content: '/content/images/starrynight/starry-night-2d-3d [www.imagesplitter.net]-' + i +'-' + j +'.png',
        //         classes: ['backfaceVisibility']
        //     });
        //     sizeCounter++;
        //     reflowable.subscribe(starryNight);
        //     pics.push(starryNight);
        // }

>>>>>>> 5e8d2908ad931c6f6018cfdc4926c3e7f4430c48
        var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";
        var surface = new Surface({
            size: [100, 100],
            content:  '' + i,
            properties: {
                backgroundColor: color
            }
        });
        reflowable.subscribe(surface);
<<<<<<< HEAD
        surfaces.push(surface);
    }

    // 2. Demonstrate gutter
    // var reflowable = new ReflowableScrollview({
    //     debounceTimer: 2000,
    //     gutter: true
=======
        pics.push(surface);
    }

    var mainContext = Engine.createContext();

    reflowable.sequenceFrom(pics);

    // make available on window for testing
    window.reflowable = reflowable;

    mainContext.setPerspective(500);

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
>>>>>>> 5e8d2908ad931c6f6018cfdc4926c3e7f4430c48
    // });
    // var surfaces = [];
    // var num = 100;
    // for (var i = 0; i < num; i += 1) {
    //     var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";
    //     var surface = new Surface({
    //         size: [100, 100],
    //         content:  '' + i,
    //         properties: {
    //             backgroundColor: color
    //         }
    //     });
    //     reflowable.subscribe(surface);
    //     surfaces.push(surface);
    // }

    // 3. Demonstrate different surface sizes
    // var reflowable = new ReflowableScrollview({
    //     // direction: Utility.Direction.Y,
    //     // curve: Easing.inOutBounce,
    //     // duration: 200,
    //     debounceTimer: 2000,
    //     gutter: true
    // });
    // var surfaces = [];
    // var num = 100;
    // var sizeCounter = 1;
    // for (var i = 0; i < num; i += 1) {
    //     var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";
    //     var surface = new Surface({
    //         size: [ 50 * (sizeCounter % 2 + 1), 50 * (sizeCounter % 4 + 1) ],
    //         content:  '' + i,
    //         properties: {
    //             backgroundColor: color
    //         }
    //     });
    //     sizeCounter++;
    //     reflowable.subscribe(surface);
    //     surfaces.push(surface);
    // }

    // 4. Demonstrate changing curves
    // var reflowable = new ReflowableScrollview({
    //     curve: Easing.inOutBounce,
    //     debounceTimer: 2000,
    //     gutter: true
    // });
    // var surfaces = [];
    // var num = 100;
    // var sizeCounter = 1;
    // for (var i = 0; i < num; i += 1) {
    //     var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";
    //     var surface = new Surface({
    //         size: [ 50 * (sizeCounter % 2 + 1), 50 * (sizeCounter % 4 + 1) ],
    //         content:  '' + i,
    //         properties: {
    //             backgroundColor: color
    //         }
    //     });
    //     sizeCounter++;
    //     reflowable.subscribe(surface);
    //     surfaces.push(surface);
    // }


    // ALWAYS INCLUDE
    reflowable.sequenceFrom(surfaces);

    var mainContext = Engine.createContext();
    mainContext.add(reflowable);
});

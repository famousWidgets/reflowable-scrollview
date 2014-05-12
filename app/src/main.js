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
        debounceTimer: 1000
    });
    var surfaces = [];
    var num = 100;
    for (var i = 0; i < num; i += 1) {
        var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";
        var surface = new Surface({
            size: [100, 100],
            content:  '' + i,
            properties: {
                backgroundColor: color
            }
        });
        reflowable.subscribe(surface);
        surfaces.push(surface);
    }

    // 2. Demonstrate gutter
    // var reflowable = new ReflowableScrollview({
    //     debounceTimer: 1000,
    //     gutter: true
    // };

    // 3. Demonstrate different surface sizes
    // var reflowable = new ReflowableScrollview({
    //     // direction: Utility.Direction.Y,
    //     // curve: Easing.inOutBounce,
    //     // duration: 200,
    //     debounceTimer: 1000,
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
    //     debounceTimer: 1000,
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

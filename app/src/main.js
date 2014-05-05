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
        direction: Utility.Direction.X
    });

    var logos = [];
    // var famousLogo;
    // var hackreactorLogo;
    var num = 20;

    for (var i = 0; i < num; i += 1) {
        // hackreactorLogo = new ImageSurface({
        //     size: [200, 200],
        //     content: '/content/images/hack_reactor.png',
        //     classes: ['backfaceVisibility']
        // });

        var color = "hsl(" + (i * 360 / 10) + ", 100%, 50%)";
        var surface = new Surface({
            size: [100, 100],
            properties: {
                backgroundColor: color
            }
        });
        reflowable.subscribe(surface);
        logos.push(surface);
    }

    // var initialTime = Date.now();
    // var centerSpinModifier = new Modifier({
    //     origin: [0.5, 0.5],
    //     transform : function() {
    //         return Transform.rotateY(0.002 * (Date.now() - initialTime));
    //     }
    // });

    var mainContext = Engine.createContext();

    reflowable.sequenceFrom(logos);

    // make available on window for testing
    window.reflowable = reflowable;

    mainContext.add(reflowable);
    // mainContext.add(centerSpinModifier).add(logo);
});

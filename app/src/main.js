/* globals define */
define(function(require, exports, module) {
    'use strict';
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ReflowableScrollview = require('views/reflowableScrollview');

    // your app here
    var famousLogo = new ImageSurface({
        size: [200, 200],
        content: '/content/images/famous_logo.png',
        classes: ['backfaceVisibility']
    });

    var hackreactorLogo = new ImageSurface({
        size: [200, 200],
        content: '/content/images/hack_reactor.png',
        classes: ['backfaceVisibility']
    });

    // var initialTime = Date.now();
    // var centerSpinModifier = new Modifier({
    //     origin: [0.5, 0.5],
    //     transform : function() {
    //         return Transform.rotateY(0.002 * (Date.now() - initialTime));
    //     }
    // });

    var mainContext = Engine.createContext();
    var logos = [famousLogo, hackreactorLogo];

    var reflowable = new ReflowableScrollview(logos);
    
    // make available on window for testing
    window.reflowable = reflowable;

    mainContext.add(reflowable);
    // mainContext.add(centerSpinModifier).add(logo);
});

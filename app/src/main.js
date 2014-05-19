define(function(require, exports, module) {
    'use strict';
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ReflowableScrollview = require('views/reflowableScrollview');
    var StateModifier = require('famous/modifiers/StateModifier');
    var OptionsView = require('views/OptionsView');
    var AppView = require('views/AppView');
    var Utility = require('famous/utilities/Utility');
    var Easing = require('famous/transitions/Easing');

    // your app here
    var appView = new AppView;
    var mainContext = Engine.createContext();
    var optionsView = new OptionsView();
    var optionsModifier = new StateModifier({
        size: [undefined,200],
        origin: [0,1]
    })

    optionsView.pipe(appView);

    mainContext.setPerspective(500);
    mainContext.add(appView);
    mainContext.add(optionsModifier).add(optionsView);
});

/**
 * Copyright (c) 2014 Famous Industries, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 *
 * @license MIT
 */


/**
 * Reflowable Scrollview
 * ------------
 * ReflowableScrollview extends Scrollview, which is one of 
 * the core views in Famo.us. It adds functionality that 
 * reflows the renderables on screen whenever there is a resize event.
 *
 * In this example, we have a Reflowable Scrollview that sequences from
 * a collection of surfaces that vary in color
 */
define(function(require, exports, module) {
    var Engine     = require("famous/core/Engine");
    var Surface    = require("famous/core/Surface");
    var Utility = require('famous/utilities/Utility');
    var Easing = require('famous/transitions/Easing');

    // will need to change this to correct directory later
    var ReflowableScrollview = require("views/reflowableScrollview");

    var mainContext = Engine.createContext();

    // * @param {Number} [options.direction=Utility.Direction.Y] Using the direction helper found in the famous Utility
    // * module, this option will lay out the Scrollview instance's renderables either horizontally
    // * (x) or vertically (y). Utility's direction is essentially either zero (X) or one (Y), so feel free
    // * to just use integers as well.
    // * @param {Number} [duration=1000] represents length of time for reflowable animation
    // * @param {String} [curve='linear'] easing curve for the reflowable animation 
    // * @param {Number} [debounceTimer=1000] amount of time delayed before triggering reflowable animation after resize
    // * @param {Boolean} [gutter=false] whether a gutter should appear between each renderable
    var reflowable = new ReflowableScrollview({
        direction: Utility.Direction.Y,
        duration: 1000,
        curve: Easing.inOutBounce,
        debounceTimer: 1000,
        gutter: true
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

    reflowable.sequenceFrom(surfaces);

    mainContext.add(reflowable);
});
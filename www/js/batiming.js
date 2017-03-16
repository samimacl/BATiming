var batiming = batiming || {};

batiming.Core = function () { };

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.isIos === true;

isAndroid = false;
isIos = true;
Template7.global = {
    android: isAndroid,
    ios: isIos
}

var $$ = Dom7;

//add css styles
if (isAndroid) {
    $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
    // Insert content/elements, to the beginning of element specified in parameter
    $$('.view .navbar').prependTo('.view .page');
}

// Initialize app
var myApp = new Framework7({
    material: isAndroid ? true : false,
    template7Pages: true,
    swipePanel: 'left'
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, material design doesn't support it.
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
});

myApp.onPageInit('about', function (page) {
    console.log("enter about view");
});
var batiming = batiming || {};

batiming.Core = function () {};

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.isIos === true;
var userLoggedIn = false; //temporär für Testzwecke

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
    material: isAndroid === true ? true : false,
    template7Pages: true,
    swipePanel: 'left',
    materialRipple: true,
    preroute: function (view, options) {
        if (!userLoggedIn) {
            userLoggedIn = true;
            view.router.loadPage('views/login.html');

            return false; //required to prevent default router action
        }
    }
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, material design doesn't support it.
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");

    $$('#b_beacon').on('click', function () {
        test.initialize();
    });

    cordova.plugins.backgroundMode.enable();
    if (isAndroid)
        cordova.plugins.backgroundMode.overrideBackButton();
    if (userLoggedIn)
        test.initialize(); //start iBeaconRange
});

myApp.onPageInit('login', function (page) {
    $$('.login-screen .list-button').on('click', function () {
        var email = $$('.login-screen input[name="username"]').val();
        var password = $$('.login-screen input[name="password"]').val();


        //  var auth = firebase.auth();
        // // sign up
        // const promise = auth.createUserWithEmailAndPassword(email, password);
        // promise.catch(e => console.log(e.message));


        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
        });
    });
});
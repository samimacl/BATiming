var batiming = batiming || {};

batiming.Core = function () {};

//var isAndroid = Framework7.prototype.device.android === true;
//var isIos = Framework7.prototype.device.isIos === true;
var isAndroid = false;
var isIos = true;

var devMode = true;

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
    materialRipple: true
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, material design doesn't support it.
    dynamicNavbar: true
});

// Load about page:
mainView.router.load({pageName: 'settings'});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
    beacon.initialize();

    cordova.plugins.backgroundMode.enable();
    if (isAndroid)
        cordova.plugins.backgroundMode.overrideBackButton();
});

$$('#b_beacon').on('click', function () {
    timeManager.startWorkFlow();
});

 $$('.login-screen .list-button').on('click', function () {
    firebase.auth().signInWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
        myApp.alert(error.message);
    });
});

 $$('.login-screen .register-login-screen').on('click', function () {
    firebase.auth().createUserWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function(error) {
        myApp.alert(error.message);
    }); 
});

 $$('.login-screen .resetpw-login-screen').on('click', function () {
    firebase.auth().sendPasswordResetEmail($$('.login-screen input[name = "username"]').val()).then(function() {
        myApp.alert("E-Mail versandt!");
    }).catch(function(error) {
        myApp.alert(error.message);
    });
});

$$('.page .sign-out').on('click', function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        myApp.loginScreen();
    }).catch(function (error) {
        // An error happened.
         myApp.alert(error.message);
    });
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        myApp.closeModal('.login-screen');
        console.log(user);
    } else {
        if (devMode) {
            myApp.closeModal('.login-screen');
        }
        // No user is signed in.
    }
});
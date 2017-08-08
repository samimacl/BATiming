var batiming = batiming || {};

batiming.Core = function () { };

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.isIos === true;
var userLoggedIn = false; //temporär für Testzwecke

var config = {
    apiKey: "AIzaSyANfxgws-hUd8UULyWBdUvz4BjRlBhq6e4",
    authDomain: "ba-timing.firebaseapp.com",
    databaseURL: "https://ba-timing.firebaseio.com",
    storageBucket: "ba-timing.appspot.com",
    messagingSenderId: "1050294194541"
};

Template7.global = {
    android: isAndroid,
    ios: isIos
};

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
    test.initialize(); //start iBeaconRange

    if (!userLoggedIn) {
        userLoggedIn = true;
        myapp.view.router.loadPage('views/login.html');

        return false; //required to prevent default router action
    }
});

myApp.onPageInit('login', function (page) {
    $$('.login-screen .list-button').on('click', function () {
        var email = $$('.login-screen input[name="username"]').val();
        var password = $$('.login-screen input[name="password"]').val();

        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                myApp.alert('Wrong password.');
            } else {
                myApp.alert(errorMessage);
            }
            console.log(error);
        });
    });
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        userLoggedIn = true;
        user.providerData.forEach(function (profile) {
            console.log("Sign-in provider: " + profile.providerId);
            console.log("  Provider-specific UID: " + profile.uid);
            console.log("  Name: " + profile.displayName);
            console.log("  Email: " + profile.email);
            console.log("  Photo URL: " + profile.photoURL);
            console.log("  UUID: " + user.uuid);
        });

    } else {
        userLoggedIn = false;
    }
})
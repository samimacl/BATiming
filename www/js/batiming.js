var batiming = batiming || {};

batiming.Core = function () { };

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.isIos === true;

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
    test.initialize(); //start iBeaconRange
});

 $$('.login-screen .list-button').on('click', function () {
    var email = $$('.login-screen input[name = "username"]').val();
    var password = $$('.login-screen input[name = "password"]').val();

    // Testzwecke
    email = "gross@softbauware.de";
    password = "tnsppv";

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        myApp.alert(error.message);
    });
});

 $$('.login-screen .register-login-screen').on('click', function () {
    var email = $$('.login-screen input[name = "username"]').val();
    var password = $$('.login-screen input[name = "password"]').val();

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        myApp.alert(error.message);
    }); 
});

 $$('.page .sign-out').on('click', function () {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
         myApp.loginScreen();
    }).catch(function(error) {
        // An error happened.
    });
});


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    myApp.closeModal('.login-screen');
    console.log(user);
  } else {
    // No user is signed in.
  }
});


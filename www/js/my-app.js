var userLoggedIn = false;
// Initialize app
var myApp = new Framework7({
    preroute: function (view, options) {
        if (!userLoggedIn) {
            userLoggedIn = true;
            view.router.loadPage('login.html');

            return false; //required to prevent default router action
        }
    }
});

// // Initialize Firebase
// var config = {
//     apiKey: "AIzaSyANfxgws-hUd8UULyWBdUvz4BjRlBhq6e4",
//     authDomain: "ba-timing.firebaseapp.com",
//     databaseURL: "https://ba-timing.firebaseio.com",
//     storageBucket: "ba-timing.appspot.com",
//     messagingSenderId: "1050294194541"
// };
// firebase.initializeApp(config);


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }

    if (page.name === 'login') {
        myApp.alert('Here comes Login page');
        $$('.login-screen .list-button').on('click', function () {
        var email = $$('.login-screen input[name="username"]').val();
        var password = $$('.login-screen input[name="password"]').val();

            
        //  var auth = firebase.auth();
        // // sign up
        // const promise = auth.createUserWithEmailAndPassword(email, password);
        // promise.catch(e => console.log(e.message));


        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
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
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})



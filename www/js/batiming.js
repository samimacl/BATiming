var batiming = batiming || {};

batiming.Core = function () {};

//var isAndroid = Framework7.prototype.device.android === true;
//var isIos = Framework7.prototype.device.isIos === true;
var isAndroid = false;
var isIos = true;

var devMode = false;

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
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, material design doesn't support it.
    dynamicNavbar: true
});

var dozentView = myApp.addView('.view-dozent', {
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
    beacon.initialize();

    cordova.plugins.backgroundMode.enable();
    if (isAndroid)
        cordova.plugins.backgroundMode.overrideBackButton();
});

$$('#b_beacon').on('click', function () {
    timeManager.startWorkflow()
        .then(function (data) {
            if (data == null)
                throw Error("Data is null");
            console.log("Workflow started" + "\n" + data);
        })
        .then(function () {
           // beacon.startMonitoringForRegion(beacon.beaconRegion);
        })
        .catch(function (e) {
            console.log(e)
        });
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
    beacon.initialize();

    cordova.plugins.backgroundMode.enable();
    if (isAndroid)
        cordova.plugins.backgroundMode.overrideBackButton();
});

// https://framework7.io/docs/form-storage.html
// https://framework7.io/docs/form-data.html
myApp.onPageInit('settings', function (page) {
    // Daten befüllen Example
    var formData = {
        'vorname': 'Andreas',
        'nachname': 'Garben',
        'email': 'john@doe.com',
        'matrikelnummer': '12345',
        'fachbereich': '2'
    }
    myApp.formFromData('#my-form', formData);
});

myApp.onPageBack('settings', function (page) {
    // Daten Speichern beim Seite verlassen Example
    var storedData = myApp.formGetData('my-form');
    if (storedData) {
        // Speeichern
        myApp.alert(JSON.stringify(storedData));
    } else {
        // keine Änderungen
        alert('Yet there is no stored data for this form. Please try to change any field')
    }
});

 $$('.panel-close').on('click', function (e) {
        myApp.closePanel();
});

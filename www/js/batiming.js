/* ----------------------------------------------------------------------------- 
 *
 *   batiming.js - Core-Klasse, initializiert App.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ------------------------------------------------------------------------- */

var $$ = Dom7;
var myApp;

var batiming = (function () {
    let batiming = {};

    //let batiming.isAndroid = Framework7.prototype.device.android === true;
    //let batiming.isIos = Framework7.prototype.device.batiming.isIos === true;
    batiming.isAndroid = false;
    batiming.isIos = true;
    batiming.devMode = false;

    //Maps
    batiming.Map = null;

    Template7.global = {
        android: batiming.isAndroid,
        ios: batiming.isIos
    }

    //add css styles
    if (batiming.isAndroid) {
        $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        // Insert content/elements, to the beginning of element specified in parameter
        $$('.view .navbar').prependTo('.view .page');
    }

    // Initialize app
    myApp = new Framework7({
        material: batiming.isAndroid === true ? true : false,
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
        if (batiming.isAndroid)
            cordova.plugins.backgroundMode.overrideBackButton();
    });

    $$('#b_beacon').on('click', function () {
        try {
            timeManager.startWorkflow()
                .then(() => console.log("Workflow started" + "\n"))
                .then(() => console.log('start Monitoring'))
                .then(() => beacon.startMonitoringForRegion(beacon.beaconRegion))
                .catch(function (e) {
                    console.log(e)
                });
        } finally {
            beacon.stopScanForBeacon(beacon.beaconRegion);
            timeManager.stopWorkflow();
        }
    });

    // https://framework7.io/docs/form-storage.html
    // https://framework7.io/docs/form-data.html
    myApp.onPageInit('settings', function (page) {
        // Get Studiengruppen
        for (var item in batiming.Map) {
            myApp.smartSelectAddOption('.smart-select select', '<option value = "' + batiming.Map[item].key + '">' + batiming.Map[item].value + '</option>');
        }
        myApp.formFromData('#my-form', JSON.parse(storageManager.getItem(true, 'userData')));
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

    batiming.initMaps = function () {
        if (batiming.Map === null) {
            database.getStudyGroups(function (data) {
                batiming.Map = data;
            })
        }
    }

    return batiming;
})();
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
        swipePanel: 'left',
        precompileTemplates: true,
        template7Pages: true,

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
            myApp.showPreloader('Custom Title');
            timeManager.startWorkflow()
                .then(() => console.log("Workflow started" + "\n"))
                .then(() => console.log('start Monitoring'))
                .then(() => beacon.startMonitoringForRegion(beacon.beaconRegion))
                .then(() => setTimeout(function () {
                    if (timeManager.state > 0) {
                        timeManager.stopWorkflow();
                        showNotification('Timeout', 'A timeout occured while scanning for iBeacon', true);
                    }
                }, 5000))
                .catch(function (e) {
                    console.log(e)
                });
        } finally {
            beacon.stopScanForBeacon(beacon.beaconRegion);
            timeManager.stopWorkflow();
            myApp.hidePreloader();
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

    // Update data
    function updateTemplate(mainData, secData) {
        if (true) {
            //myPageContentStudenten
            myApp.template7Data.student = mainData;
            myApp.template7Data.student.studentNextEntry = secData;
            $$('.page[data-page="index"] .page-content .myPageContentStudenten').html(Template7.templates.studentenTemplate(mainData));
        }
        else {
            // myPageContentDozent
            myApp.template7Data.dozent = mainData;
            myApp.template7Data.dozent.students = secData;
            $$('.page[data-page="index"] .page-content .myPageContentDozent').html(Template7.templates.dozentenTemplate(mainData));
        }
    }

    function getTemplateData(refresh) {
        var obj = JSON.parse('{ "title":"Test1", "id":1, "subtitle":"Untertitel1", "Name":"NameVorlesung"}');

        //localStorage.getItem('stories')
        var resultsMainData = refresh ? [] : obj || [];
        var resultsSecData = refresh ? [] : obj || [];

        if (resultsMainData.length === 0) {
            //https://github.com/GuillaumeBiton/HackerNews7/blob/master/src/js/hn7.js
            for (var i = 1; i <= 3; i++) {
                resultsMainData[i] = obj;
            }
            // Clear Empty Object in list
            resultsMainData = resultsMainData.filter(function (n) {
                return n !== null;
            });
        }

        if (resultsSecData.length === 0) {
            resultsSecData[0] = obj;

            resultsSecData = resultsSecData.filter(function (n) {
                return n !== null;
            });
        }

        myApp.pullToRefreshDone();
        updateTemplate(resultsMainData, resultsSecData);

        return resultsMainData;
    }

    $$('.pull-to-refresh-content').on('refresh', function () {
        getTemplateData(true);
    });

    return batiming;
}());
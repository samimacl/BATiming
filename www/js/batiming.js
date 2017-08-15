var $$ = Dom7;
var myApp;

var batiming = (function () {
    let batiming = {};

    //var isAndroid = Framework7.prototype.device.android === true;
    //var isIos = Framework7.prototype.device.isIos === true;
    let isAndroid = false;
    let isIos = true;

    let devMode = false;

    Template7.global = {
        android: isAndroid,
        ios: isIos
    }

    //add css styles
    if (isAndroid) {
        $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        // Insert content/elements, to the beginning of element specified in parameter
        $$('.view .navbar').prependTo('.view .page');
    }

    // Initialize app
    myApp = new Framework7({
        material: isAndroid === true ? true : false,
        template7Pages: true,
        swipePanel: 'left',
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

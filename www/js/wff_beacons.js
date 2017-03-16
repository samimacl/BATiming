var wf_beacons = (function () {

    // Application object.
    var wf_beacons = {};

    // Region by uuid and major 114 (BARM Beacon Area)
    wf_beacons.beaconRegionLoctigo = {
        id: 'BARM-Beacon',
        uuid: '20cae8a0-a9cf-11e3-a5e2-0800200c9a66', // set!
        major: 104
    };

    wf_beacons.proximityNames = [
        'unknown',
        'immediate',
        'near',
        'far'
    ];

    wf_beacons.delegate = null;
    wf_beacons.beaconsInRegion = [];

    // some flags 
    wf_beacons.beaconsInUse = true;
    wf_beacons.inBeaconRegion = false;
    wf_beacons.checkAppStartInRegion = true;
    wf_beacons.allowBeaconInfos = false;

    // determin if to stop ranging after beacon was found in reagion until re-entry in region
    // give user choice in settings
    wf_beacons.stopRangingBeaconsUntilNewEntry = true;

    // will be set when beacon found, not part of beaconRegion!
    wf_beacons.beaconMinor = 'unbekannt';

    wf_beacons.scheduledExitFunc = "";


    wf_beacons.initialize = function () {
        // this is done after device ready, not here
        wf_beacons.initBeaconDelegates();
        wf_beacons.allowBeaconInfos = true;
    };

    //
    // BEACON usage STOP  
    //

    wf_beacons.stopBeaconUsage = function () {
        wf_beacons.delegate = null;
        wf_beacons.allowBeaconInfos = false;
        wf_beacons.beaconMinor = 'unbekannt';
    };

    /**
     * BEACON Initialisation of delegates  
     */
    wf_beacons.initBeaconDelegates = function () {

        // var delegate = new cordova.plugins.locationManager.Delegate();

        // save delegate to have access and delete again later, if user switches off beacons
        wf_beacons.delegate = new cordova.plugins.locationManager.Delegate();

        if (wf_beacons.delegate) {

            wf_beacons.delegate.didExitRegion = function (pluginResult) {

                console.log("didExitRegion...EXIT DONE" + "<br>" + JSON.stringify(pluginResult));

                // to prevent EXIT-ENTER bouncing (as recognized on Android):
                // schedule exit func 3 sec and clear again on re-entry within 10 sec  
                // wf_beacons.scheduledExitFunc = setTimeout(function() { wf_beacons.exitRegionFunc(); }, 3000);
                wf_beacons.exitRegionFunc(beaconRegion);

            };

            wf_beacons.delegate.didEnterRegion = function (pluginResult) {

                // check, if exit is scheduled (happend only 10 sec ago)
                //if (wf_beacons.scheduledExitFunc) { 
                //    clearTimeout(wf_beacons.scheduledExitFunc); 
                //} else {
                console.log("didEnterRegion...ENTER DONE" + "<br>" + JSON.stringify(pluginResult));
                wf_beacons.enterRegionFunc(beaconRegion);
                //};
            };

            wf_beacons.delegate.didDetermineStateForRegion = function (pluginResult) {

                //if (wf_app.debug_verbose_state) alert("didDeterminStateForRegion...DONE");

                console.log('didDetermineStateForRegion! The state is: ' + pluginResult.state);

                // check if user already in beacon region
                if (pluginResult.state == "CLRegionStateInside") {
                    //Start ranging to get beacon data
                    //locationManager.startRangingBeaconsInRegion(beaconRegion).fail(console.error).done();
                    wf_beacons.inBeaconRegion = true;

                    wf_app.manageZoneStates();
                    wf_app.manageButtonStates();


                    locationManager.stopRangingBeaconsInRegion(beaconRegion)
                        .fail(function () { alert("Stop Ranging Beacons In Region...FAILED"); })
                        .done(function () { console.log("Ranging Beacons In Region...STOPPED"); });


                    if (wf_beacons.allowBeaconInfos) {
                        // wf_utility.show_notification("Innerhalb der Buchungsregion", 
                        //                             "Buchungen können jetzt vorgenommen werden!", 5000);
                    }

                } else {
                    wf_beacons.inBeaconRegion = false;
                    console.log('Now NO MORE in beacons region!');
                }
            };

            wf_beacons.delegate.didStartMonitoringForRegion = function (pluginResult) {
                console.log('didStartMonitoringForRegion:', + '<br>' + JSON.stringify(pluginResult));
            };


            wf_beacons.delegate.didRangeBeaconsInRegion = function (data) {

                console.log('Did range beacons in Region!');

                var index;

                // this is the important heart of the beacon managing algorithm 
                // very difficult because parallel asynchronous behavior 

                // for (index = 0; index < data.beacons.length; ++index) {

                // stop after first found beacon - so beaconsInReagion ARRAY does not contain all beacons only first found
                // hopefully this is the nearest - but anyway if there is at least one -> booking allowed

                // check if there is at least one beacon in queue -> array index 0

                if (data.beacons[0]) {

                    index = 0;

                    wf_beacons.beaconsInRegion.push(data.beacons[index].minor);
                    wf_beacons.beaconMinor = data.beacons[index].minor;
                    wf_beacons.inBeaconRegion = true;

                    if (wf_beacons.stopRangingBeaconsUntilNewEntry) {
                        locationManager.stopRangingBeaconsInRegion(beaconRegion)
                            .fail(function () { alert("STOPPING Ranging Beacons In Region...FAILED"); })
                            .done(function () { console.log("Ranging Beacons In Region...STOPPED"); });
                    }
                }

                console.log('Beacons-Array: ' + wf_beacons.beaconsInRegion);
                wf_app.manageZoneStates();
                wf_app.manageButtonStates();

            };

            // called if anything fails
            wf_beacons.delegate.monitoringDidFailForRegionWithError = function (error) {

                wf_app.addNotification('Beacon-Monitoring-Fehler', JSON.stringify(error));

                // consol.log(JSON.stringify(error));
            };

            // Set the delegate object to use.
            locationManager.setDelegate(wf_beacons.delegate);

            // Start monitoring 
            // To save battery: Start rainging only when region was entered.

            var region = wf_beacons.beaconRegionLoctigo;

            // var beaconRegion = new locationManager.BeaconRegion(region.id,
            //        region.uuid, region.major, region.minor)
            var beaconRegion = new locationManager.BeaconRegion(region.id, region.uuid); //, region.major);

            // Start monitoring.
            locationManager.startMonitoringForRegion(beaconRegion)
                .fail(function () { alert("Start Monitoring For Region...FAILED"); })
                .done(function () { console.log("Monitoring For Region...START"); });

            // If checkAppStartInRegion is true start ranging from the beginning 
            // because no didEnterRegion is given if user already in beacon region -> no detection of booking zone
            if (wf_beacons.checkAppStartInRegion) {
                locationManager.startRangingBeaconsInRegion(beaconRegion)
                    .fail(function () { alert("Start Ranging Beacons In Region...FAILED"); })
                    .done(function () { console.log("Ranging Beacons In Region...START"); });
            }
        }
    };

    // Function called, on didExitRegion

    wf_beacons.exitRegionFunc = function (beaconRegion) {

        // reset schedule indicator
        wf_beacons.scheduledExitFunc = "";

        if (wf_beacons.allowBeaconInfos) {
            wf_utility.show_notification('Buchungsregion verlassen',
                'Button wird wieder gesperrt!', 5000);
        }

        // Stop ranging.
        locationManager.stopRangingBeaconsInRegion(beaconRegion)
            .fail(function () { alert("stopRangingBeaconsInRegion...FAILED"); })
            .done(function () { console.log("Ranging Beacons In Region...STOP"); });

        wf_beacons.inBeaconRegion = false;
        wf_beacons.beaconMinor = 'unbekannt';
        wf_beacons.beaconsInRegion = [];

        wf_app.manageZoneStates();
        wf_app.manageButtonStates();

        // vibrate
        //wf_utility.vibrate();
    };


    // Function called, on didEnterRegion

    wf_beacons.enterRegionFunc = function (beaconRegion) {

        if (wf_beacons.allowBeaconInfos) {
            wf_utility.show_notification('Buchungsregion betreten',
                'Buchungen können jetzt vorgenommen werden!', 5000);
        }

        // Start ranging to get beacon data
        locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(function () { alert("startRangingBeaconsInRegion...FAILED"); })
            .done(function () { console.log("Ranging Beacons In Region...START"); });

        wf_beacons.inBeaconRegion = true;
        wf_app.manageZoneStates();
        wf_app.manageButtonStates();
    };

    return wf_beacons;

})();


var test = (function () {
    let test = {};

    test.beaconRegion = {
        id: 'BARM-Beacon',
        uuid: '20cae8a0-a9cf-11e3-a5e2-0800200c9a66', // set!
        major: 104
    };

    test.proximityNames = [
        'unknown',
        'immediate',
        'near',
        'far'
    ];

    test.delegate = null;

    test.inBeaconRegion = false;
    test.checkAppStartInRegion = true;
    test.stopRangingBeaconsUntilNewEntry = true;
    test.beaconMinor = 'unbekannt';
    test.scheduleExitFunc = '';

    test.initialize = function () {
        window.locationManager = cordova.plugins.locationManager;
        test.InitializeBeaconDelegate();
    }

    test.logToDom = function (message) {
      /*  var e = document.createElement('label');
        e.innerText = message;

        var br = document.createElement('br');
        var br2 = document.createElement('br');
        document.body.appendChild(e);
        document.body.appendChild(br);
        document.body.appendChild(br2);

        window.scrollTo(0, window.document.height); */
        console.log(message);
    };

    test.InitializeBeaconDelegate = function () {
        test.delegate = new cordova.plugins.locationManager.Delegate();

        if (test.delegate) {
            test.delegate.didExitRegion = function (pluginResult) {
                console.log("didExitRegion... EXIT DONE" + "<br>" + JSOn.stringify(pluginResult));
                //setTimeout ExitFunc
                test.stopScanForBeacon(beaconRegion);
            };

            test.delegate.didEnterRegion = function (pluginResult) {
                console.log("didEnterRegion...ENTER DONE" + "<br>" + JSON.stringify(pluginResult));
                test.inBeaconRegion = true;
                test.startScanForBeacon(beaconRegion);
            };

            test.delegate.didDetermineStateForRegion = function (pluginResult) {
                test.logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' +
                    JSON.stringify(pluginResult));

                if (pluginResult.state == "CLRegionStateInside") {
                    ba_beacons.inBeaconRegion = true;
                    locationManager.stopRangingBeaconsInRegion(beaconRegion)
                        .fail(function () {
                            alert("Stop Ranging Beacons In Region...FAILED");
                        })
                        .done(function () {
                            console.log("Ranging Beacons In Region...STOPPED");
                        });
                }
            };

            test.delegate.didStartMonitoringForRegion = function (pluginResult) {
                console.log('didStartMonitoringForRegion:', pluginResult);
                test.logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
            };

            test.delegate.didRangeBeaconsInRegion = function (pluginResult) {
                test.logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));

                if (pluginResult.beacons[0]) {
                    test.beaconMinor = pluginResult.beacons[0].minor;
                    test.inBeaconRegion = true;

                    if (test.stopRangingBeaconsUntilNewEntry) {
                        locationManager.stopRangingBeaconsInRegion(beaconRegion)
                            .fail(function (e) {
                                console.error(e)
                            })
                            .done();
                    }
                }
            };

            test.delegate.monitoringDidFailForRegionWithError = function (error) {
                test.logToDom('Beacon-Monitoring-Fehler', JSON.stringify(error));
            };

            locationManager.setDelegate(test.delegate);

            let reg = test.beaconRegion;
            let beaconRegion = new locationManager.BeaconRegion(reg.id, reg.uuid);
            test.startScanForBeacon(beaconRegion);
        }

    };

    test.startScanForBeacon = function (beaconRegion) {
        locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done()
    }

    test.stopScanForBeacon = function (beaconRegion) {
        locationManager.stopRangingBeaconsInRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done();

        test.scheduledExitFunc = '';
        test.inBeaconRegion = false;
        test.beaconMinor = 'unbekannt';
    }

    test.stopBeaconUsage = function() {
        test.delegate = null;
        test.beaconMinor = 'unbekannt';
    }

    return test;
})();
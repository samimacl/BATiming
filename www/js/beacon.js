var beacon = (function () {
    let beacon = {};

    beacon.RegionData = {
        id: 'BARM-Beacon',
        uuid: '20cae8a0-a9cf-11e3-a5e2-0800200c9a66', // set!
        major: 125,
        minor: 18953
    };

    beacon.proximityNames = [
        'unknown',
        'immediate',
        'near',
        'far'
    ];

    beacon.delegate = null;

    beacon.inBeaconRegion = false;
    beacon.beaconRegion = null;
    beacon.checkAppStartInRegion = true;
    beacon.stopRangingBeaconsUntilNewEntry = true;
    beacon.beaconMinor = 'unbekannt';

    beacon.initialize = function () {
        window.locationManager = cordova.plugins.locationManager;
        beacon.InitializeBeaconDelegate();
    }

    beacon.InitializeBeaconDelegate = function () {
        beacon.delegate = new cordova.plugins.locationManager.Delegate();

        if (beacon.delegate) {
            beacon.delegate.didExitRegion = function (pluginResult) {
                console.log("didExitRegion... EXIT DONE" + "<br>" + JSON.stringify(pluginResult));
                beacon.stopScanForBeacon(beacon.beaconRegion);
            };

            beacon.delegate.didEnterRegion = function (pluginResult) {
                console.log("didEnterRegion...ENTER DONE" + "<br>" + JSON.stringify(pluginResult));
                beacon.startScanForBeacon(beacon.beaconRegion);
            };

            beacon.delegate.didDetermineStateForRegion = function (pluginResult) {
                console.log('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' +
                    JSON.stringify(pluginResult));

                if (pluginResult.state == "CLRegionStateInside") {
                   console.log("In Region");
                } else if (pluginResult.state === "CLRegionStateOutside") {
                    console.log("Exit Region");
                }
            };

            beacon.delegate.didStartMonitoringForRegion = function (pluginResult) {
                console.log('didStartMonitoringForRegion:', pluginResult);
                console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
            };

            beacon.delegate.didRangeBeaconsInRegion = function (pluginResult) {
                console.log('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
                if (pluginResult.beacons[0]) {
                    beacon.beaconMinor = pluginResult.beacons[0].minor;
                    beacon.inBeaconRegion = true;
                    timeManager.bookTimeEntry(JSON.stringify(pluginResult));

                    if (beacon.stopRangingBeaconsUntilNewEntry) {
                        locationManager.stopRangingBeaconsInRegion(beacon.beaconRegion)
                            .fail(function (e) {
                                console.error(e)
                            })
                            .done();
                    }
                }
            };

            beacon.delegate.monitoringDidFailForRegionWithError = function (error) {
                console.log('Beacon-Monitoring-Fehler', JSON.stringify(error));
            };

            locationManager.setDelegate(beacon.delegate);
            let reg = beacon.RegionData;
            beacon.beaconRegion = new locationManager.BeaconRegion(reg.id, reg.uuid, reg.major, reg.minor);
        }

    };

    beacon.startMonitoringForRegion = function (beaconRegion) {
        locationManager.startMonitoringForRegion(beaconRegion)
            .fail(function () {
                alert("Start Monitoring For Region...FAILED");
            })
            .done(function () {
                console.log("Monitoring For Region...START");
            });
    }

    beacon.startScanForBeacon = function (beaconRegion) {
        locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done( beacon.inBeaconRegion = true)
    }

    beacon.stopScanForBeacon = function (beaconRegion) {
        locationManager.stopRangingBeaconsInRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done();

        locationManager.stopMonitoringForRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done(console.log("Stop Monitoring"));

        beacon.inBeaconRegion = false;
        beacon.beaconMinor = 'unbekannt';
    }

    beacon.stopBeaconUsage = function () {
        beacon.delegate = null;
        beacon.beaconMinor = 'unbekannt';
    }

    return beacon;
})();
var beacon = (function () {
    let beacon = {};

    let regionData = {
        id: 'BARM-Beacon',
        uuid: '20cae8a0-a9cf-11e3-a5e2-0800200c9a66', // set!
        major: 125,
        minor: 18953
    };

    let delegate = null;

    let inBeaconRegion = false;
    let beaconRegion = null;
    let checkAppStartInRegion = true;
    let stopRangingBeaconsUntilNewEntry = true;
    let beaconMinor = 'unbekannt';

    beacon.initialize = function () {
        window.locationManager = cordova.plugins.locationManager;
        beacon.InitializeBeaconDelegate();
    }

    beacon.InitializeBeaconDelegate = function () {
        delegate = new cordova.plugins.locationManager.Delegate();

        if (delegate) {
            delegate.didExitRegion = function (pluginResult) {
                console.log("didExitRegion... EXIT DONE" + "<br>" + JSON.stringify(pluginResult));
                beacon.stopScanForBeacon(beaconRegion);
            };

            delegate.didEnterRegion = function (pluginResult) {
                console.log("didEnterRegion...ENTER DONE" + "<br>" + JSON.stringify(pluginResult));
                beacon.startScanForBeacon(beaconRegion);
            };

            delegate.didDetermineStateForRegion = function (pluginResult) {
                console.log('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' +
                    JSON.stringify(pluginResult));

                if (pluginResult.state == "CLRegionStateInside") {
                   console.log("In Region");
                } else if (pluginResult.state === "CLRegionStateOutside") {
                    console.log("Exit Region");
                }
            };

            delegate.didStartMonitoringForRegion = function (pluginResult) {
                console.log('didStartMonitoringForRegion:', pluginResult);
                console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
            };

            delegate.didRangeBeaconsInRegion = function (pluginResult) {
                console.log('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
                if (pluginResult.beacons[0]) {
                    beaconMinor = pluginResult.beacons[0].minor;
                    inBeaconRegion = true;
                    timeManager.bookTimeEntry(JSON.stringify(pluginResult));

                    if (stopRangingBeaconsUntilNewEntry) {
                        locationManager.stopRangingBeaconsInRegion(beaconRegion)
                            .fail(function (e) {
                                console.error(e)
                            })
                            .done();
                    }
                }
            };

            delegate.monitoringDidFailForRegionWithError = function (error) {
                console.log('Beacon-Monitoring-Fehler', JSON.stringify(error));
            };

            locationManager.setDelegate(delegate);
            let reg = beacon.RegionData;
            let beaconRegion = new locationManager.BeaconRegion(reg.id, reg.uuid, reg.major, reg.minor);
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

        inBeaconRegion = false;
        beaconMinor = 'unbekannt';
    }

    beacon.stopBeaconUsage = function () {
        beacon.delegate = null;
        beacon.beaconMinor = 'unbekannt';
    }

    beacon.getDelegate = function () {
        return delegate;
    }

    return beacon;
})();
var test = (function () {
    let test = {};

    test.beaconRegion = {
        id: 'BARM-Beacon',
        uuid: '20cae8a0-a9cf-11e3-a5e2-0800200c9a66', // set!
        major: 104,
        minor: 1000
    };

    test.proximityNames = [
        'unknown',
        'immediate',
        'near',
        'far'
    ];

    test.initialize = function () {
        window.locationManager = cordova.plugins.locationManager;
        test.startScanForBeacon();
    }

    test.logToDom = function (message) {
        var e = document.createElement('label');
        e.innerText = message;

        var br = document.createElement('br');
        var br2 = document.createElement('br');
        document.body.appendChild(e);
        document.body.appendChild(br);
        document.body.appendChild(br2);

        window.scrollTo(0, window.document.height);
    };

    test.startScanForBeacon = function () {
        var delegate = new cordova.plugins.locationManager.Delegate();

        delegate.didDetermineStateForRegion = function (pluginResult) {
            logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
            cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' +
                JSON.stringify(pluginResult));
        };

        delegate.didStartMonitoringForRegion = function (pluginResult) {
            console.log('didStartMonitoringForRegion:', pluginResult);
            logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
        };

        delegate.didRangeBeaconsInRegion = function (pluginResult) {
            logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
            test.didRangeBeaconsInRegion(pluginResult);
        };

        locationManager.setDelegate(delegate);

        let reg = test.beaconRegion;
        let beaconRegion = new locationManager.BeaconRegion(reg.id, reg.uuid, reg.major, reg.minor);

        //start ranging
        locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done()

        /* locationManager.didStartMonitoringForRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done()
        */

    };

    test.stopScanForBeacon = function () {
        let reg = test.beaconRegion;
        let beaconRegion = new locationManager.BeaconRegion(reg.id, reg.uuid, reg.major, reg.minor);

        locationManager.stopRangingBeaconsInRegion(beaconRegion)
            .fail(function (e) {
                console.error(e);
            })
            .done();
    }

    test.didRangeBeaconsInRegion = function (pluginResult) {
        if (0 == pluginResult.beacons.length) {
            return
        }

        // Our regions are defined so that there is one beacon per region.
        // Get the first (and only) beacon in range in the region.
        var beacon = pluginResult.beacons[0]

        // The region identifier is the page id.
        var pageId = pluginResult.region.identifier

        //console.log('ranged beacon: ' + pageId + ' ' + beacon.proximity)

        // If the beacon is close and represents a new page, then show the page.
        /*  if ((beacon.proximity == 'ProximityImmediate' || beacon.proximity == 'ProximityNear')
              && app.currentPage != pageId) {
              app.gotoPage(pageId)
              return
          }
  
          // If the beacon represents the current page but is far away,
          // then show the default page.
          if ((beacon.proximity == 'ProximityFar' || beacon.proximity == 'ProximityUnknown')
              && app.currentPage == pageId) {
              app.gotoPage('page-default')
              return
          } */
    }
    return test;
})();
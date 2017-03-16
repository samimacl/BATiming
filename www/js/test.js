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

    test.initialize = function () {
        window.locationManager = cordova.plugins.locationManager;
        test.startScanForBeacon();
    }

    test.startScanForBeacon = function () {
        test.delegate = new cordova.plugins.locationManager.Delegate();

        test.delegate.didDetermineStateForRegion = function (pluginResult) {

        };

        test.delegate.didStartMonitoringForRegion = function (pluginResult) {

        };

        test.delegate.didRangeBeaconsInRegion = function (pluginResult) {
            test.didRangeBeaconsInRegion(pluginResult);
        };

        locationManager.setDelegate(test.delegate);
        let reg = test.beaconRegion;
        let beaconRegion = new locationManager.BeaconRegion(reg.id, reg.uuid, reg.major, reg.minor);
        locationManager.didStartMonitoringForRegion(beaconRegion)
            .fail(console.error)
            .done()

        //start ranging
        locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(console.error)
            .done()
    };

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
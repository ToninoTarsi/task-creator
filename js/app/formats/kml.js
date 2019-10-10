
/**
 * @file
 * KML format for the task creator.
 */
define(['rejs!formats/export/kml'], function (exportKML) {

  var check = function (text, filename) {
    let extension = filename.split('.').pop();
    if (extension == 'kml' || extension == 'kmz') {
      return true;
    }
    return false;
  }

  var parse = function (text, filename) {
    return {
      'KmlLayer': {
        'filename': filename,
        'kml' : text,
      },
    }
  }

  var exporter = function (turnpoints, taskInfo) {
    var fastWaypoints = taskInfo.fastWaypoints.map(function (point) {
      return point.lng() + ',' + point.lat() + ',' + '1';
    });

    var data = exportKML({
      turnpoints: turnpoints,
      taskInfo: taskInfo,
      fastWaypoints: fastWaypoints
    });
    return new Blob([data], { 'type': "text/xml" });
  }

  return {
    'check': check,
    'exporter': exporter,
    'extension': '.kml',
    'name': 'KML',
    'parse': parse,
  }
});


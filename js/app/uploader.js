/**
 * @file
 * File Uplader module for the task creator. 
 */
define(['Dropzone', 'app/wpParser', 'jquery'], function(Dropzone, wpParser, $) {
  Dropzone.autoDiscover = false;
  
  var reader = new FileReader();
  var filename = '';

  var setFilename = function(newName) {
    filename = newName;
  }

  var parse = function(text) {
    var parseInfo = wpParser.parse(text, filename);
    if (parseInfo == undefined) {
      return;
    }
    if (parseInfo.waypoints) {
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent('newWaypointFile', false, false, {
        waypoints : parseInfo.waypoints,
      });
      document.dispatchEvent(e);
    }
    
    if (parseInfo.tracks) {
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent('newTrackFile', false, false, {
        tracks : parseInfo.tracks,
      });
      document.dispatchEvent(e); 
    }

    if (parseInfo.task) {
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent('newTask', false, false, {
        waypoints : parseInfo.waypoints,
        task : parseInfo.task,
      });
      document.dispatchEvent(e); 
    }

    if (parseInfo.KmlLayer) {
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent('newKmlLayer', false, false, {
        KmlLayer : parseInfo.KmlLayer,
      });
      document.dispatchEvent(e); 
    }

    if (parseInfo.competition) {
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent('setUtcOffset', false, false, {
        utcOffset : parseInfo.competition.utcOffset,
      });
      document.dispatchEvent(e); 
    }
  }

  reader.onload = function(e) {
    var text = reader.result;
    parse(text);
  }
  
  $("#uploader").addClass('dropzone');

  var myDz = new Dropzone("#uploader", {
    maxFiles : 1,
    acceptedFiles : '.txt, .TXT, .wpt, .WPT, .igc, .IGC, .cup, .CUP, .gpx, .GPX, .tsk, .TSK, .geojson, .GEOJSON, .xctsk , .XCTSK , .fstask , .FSTASK , .fsdb , .FSDB , .kml , .KML,', 
    dictDefaultMessage : "Drop files or click here"
  });
  
  myDz.on("addedfile", function(file) {
    filename = file.name;
    reader.readAsText(file);
    myDz.removeFile(file);
  });

  return {
    setFilename : setFilename,
    parse : parse, 
  };
});

/**
  @file
  Task importer for the task creator.
  **/
define(['rejs!formats/export/tsk', 'utils/timeUtils'], function(exportTSK, timeUtils) {
  var check = function(text, filename) {
    if (filename.split('.').pop() == 'tsk') {
      return true;
    }
    return false;
  }

  var parse = function(text, filename) {
    if (window.DOMParser) {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(text, "text/xml");
    }

    var rtetp = xmlDoc.getElementsByTagName("rtept");
    var tps = [];
    var wps = [];
    var array = ['close', 'goalType', 'index', 'mode', 'open', 'radius', 'type'];

    var date = xmlDoc.getElementsByTagName('date')[0].childNodes[0] ? xmlDoc.getElementsByTagName('date')[0].childNodes[0].nodeValue : 0;
    var day = Number(date.split('-')[0]);
    var turn = (day % 2 == 0) ? 'right' : 'left';
    
    for (var i = 0; i < rtetp.length; i++) {
      var tp = {};


      tp['close'] =  rtetp[i].getElementsByTagName('close')[0].childNodes[0] ? rtetp[i].getElementsByTagName('close')[0].childNodes[0].nodeValue : 0;
      tp['goalType'] =  rtetp[i].getElementsByTagName('goalType')[0].childNodes[0] ? rtetp[i].getElementsByTagName('goalType')[0].childNodes[0].nodeValue : 0;
      tp['index'] =  Number(rtetp[i].getElementsByTagName('index')[0].childNodes[0] ? rtetp[i].getElementsByTagName('index')[0].childNodes[0].nodeValue : 0);
      tp['mode'] =  rtetp[i].getElementsByTagName('mode')[0].childNodes[0] ? rtetp[i].getElementsByTagName('mode')[0].childNodes[0].nodeValue : 0;
      tp['open'] =  rtetp[i].getElementsByTagName('open')[0].childNodes[0] ? rtetp[i].getElementsByTagName('open')[0].childNodes[0].nodeValue : 0;
      tp['radius'] =  Number(rtetp[i].getElementsByTagName('radius')[0].childNodes[0] ? rtetp[i].getElementsByTagName('radius')[0].childNodes[0].nodeValue : 0);
      tp['type'] =  rtetp[i].getElementsByTagName('type')[0].childNodes[0] ? rtetp[i].getElementsByTagName('type')[0].childNodes[0].nodeValue : 0;


      // for (var y = 0; y < array.length; y++) {
      //   var e = array[y]
      //   tp[e] =  rtetp[i].getElementsByTagName(e)[0].childNodes[0] ? rtetp[i].getElementsByTagName(e)[0].childNodes[0].nodeValue : 0;
      // }
      
      if (tp.type == 'endofspeedsection') {
        tp.type = 'end-of-speed-section';
      } 

      var wp = {  
        filename : filename, //rtetp[i].getElementsByTagName('filename')[0].childNodes[0].nodeValue,
        id : rtetp[i].getElementsByTagName('id')[0].childNodes[0].nodeValue,
        name : rtetp[i].getElementsByTagName('name')[0].childNodes[0].nodeValue,
        type : 1,
        x : Number(rtetp[i].getAttribute('lat')),
        y : Number(rtetp[i].getAttribute('lon')),
        z : Number(rtetp[i].getElementsByTagName('z')[0].childNodes[0].nodeValue),
      }
      wps.push(wp);
      tp.wp = wp;
      tps.push(tp);
    } 

    // console.log(JSON.stringify(tps, undefined, 2)) 
    // console.log(JSON.stringify(wps, undefined, 2)) 

    let tinfo = ""

    //alert(xmlDoc.getElementsByTagName('info').length);
    if (xmlDoc.getElementsByTagName('info').length == 1 ) {
      if (xmlDoc.getElementsByTagName('info')[0].childNodes[0] != undefined) {
       tinfo = xmlDoc.getElementsByTagName('info')[0].childNodes[0].nodeValue
      } 
    }
   
    var utcOffset = xmlDoc.getElementsByTagName('utcoffset').childNode? xmlDoc.getElementsByTagName('utcoffset').childNodes[0].nodeValue 
      : timeUtils.getLocalOffset();

    return {
      'task' : {
        'date' : xmlDoc.getElementsByTagName('date')[0].childNodes[0].nodeValue,
        'type' : xmlDoc.getElementsByTagName('type')[0].childNodes[0].nodeValue,
        'num' : xmlDoc.getElementsByTagName('num')[0].childNodes[0].nodeValue,
        'ngates' : xmlDoc.getElementsByTagName('ngates')[0].childNodes[0].nodeValue,
        'gateint' : xmlDoc.getElementsByTagName('gateint')[0].childNodes[0].nodeValue,
        'turn' : turn,
        'utcOffset' : utcOffset,
        'info' : tinfo,
        'turnpoints' : tps,
      },
      'waypoints' : wps,
    }
  }
  
  var exporter = function(turnpoints, taskInfo) {
    var data = exportTSK({
      turnpoints : turnpoints,
      taskInfo : taskInfo,
    });
    return new Blob([data], {'type': "text/xml"});
  }

  return {
    'check' : check,
    'exporter' : exporter,
    'extension' : '.tsk',
    'name' : 'TSK',
    'parse' : parse,
  }
});

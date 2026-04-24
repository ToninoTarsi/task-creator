/**
  @file
  Task importer for the task creator.
  **/
define(['rejs!formats/export/FsTask', 'utils/timeUtils', 'formats/FsTask'], function (exportFsTask, timeUtils, FsTask) {

  Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
  }

  var x2js = new X2JS();
  var jsonDB = null;

  Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
  }

  var check = function (text, filename) {
    if (filename.split('.').pop() == 'fsdb') {
      return true;
    }
    return false;
  }

  var parse = function (text, filename) {

    var tps = [];
    var wps = [];
    var gateint = 15;
    var ngates = 1;

    jsonDB = x2js.xml_str2json(text);

    $.jGrowl(' Competirion DB  succesfully imported from file : ' + filename + ' !!', {
      header: 'success',
      theme: 'success',
      sticky: false,
      position: 'top-left',
    });

    var tasks = jsonDB.Fs.FsCompetition.FsTasks.FsTask;
    var utc_offset = timeUtils.convertUtcOffset(jsonDB.Fs.FsCompetition._utc_offset ?? 0);

    var taskN = 0;
    let nt = 1;

    if (tasks != undefined) {
      if (tasks.length != undefined) {
        nt = tasks.length;
      }
      taskN = window.prompt("Tasks in file : " + nt + "\nSelect task number or cancel not to load a task and just load the competition DB", "1");
    }

    if (isNaN(taskN) || taskN <= 0 || taskN > nt) {
      return {
        'competition': {
          'utcOffset': utc_offset,
        }
      }  
    }

    let jsonObj;
    if (nt == 1) {
      jsonObj = { FsTask: tasks };
    }
    else {
      jsonObj = { FsTask: tasks[taskN - 1] };
    }

    var result = FsTask.parseTask(jsonObj, filename);
    result.task.jumpTheGun = Number(jsonObj.FsTask.FsScoreFormula._jump_the_gun_max);
    result.task.turnpointTollerance = Number(jsonObj.FsTask.FsScoreFormula._turnpoint_radius_tolerance);
    result.task.utcOffset = utc_offset;

    return result;
  }


  var exporter = function (turnpoints, taskInfo) {

    if (jsonDB == null) {
      alert("No FsDB database loaded. Before exporting please open one (without loading a task)\nThe task will be added to that database")
      return;
    }

    var utcOffsetNumber = Number(jsonDB.Fs.FsCompetition._utc_offset)
    var utcOffset = timeUtils.convertUtcOffset(utcOffsetNumber);
    var FsScoreFormula = x2js.json2xml_str({ FsScoreFormula: jsonDB.Fs.FsCompetition.FsScoreFormula });
    var tasks = jsonDB.Fs.FsCompetition.FsTasks.FsTask;
    var taskN = 0;
    if (tasks != undefined) {
      if (tasks.length == undefined) {
        taskN = 1;
      }
      else {
        taskN = tasks.length;
      }
    }

    var taskID = taskN + 1;

    var times = [];
    var starts = [];

    // turnpoints[0] is assumend as Takeoff
    var time = {
      open: turnpoints[0].open,
      close: turnpoints[0].close
    };
    times.push(time);

    // turnpoints[1] is assumend as Start
    var time = {
      open: turnpoints[1].open,
      close: turnpoints[turnpoints.length - 1].close
    };
    times.push(time);

    var es = turnpoints.length;

    for (let i = 2; i < turnpoints.length; i++) {
      if (turnpoints[i].type == 'end-of-speed-section') {
        es = i + 1;
      }
      var time = {
        open: turnpoints[1].open,
        close: turnpoints[turnpoints.length - 1].close
      };
      times.push(time);
    }

    starts.push([turnpoints[1].open]);
    let h = Number(turnpoints[1].open.split(':')[0]);
    let m = Number(turnpoints[1].open.split(':')[1]);
    for (let i = 1; i < taskInfo.ngates; i++) {
      m += Number(taskInfo.gateint);
      if (m >= 60) {
        m -= 60;
        h++;
      }
      starts.push(h.pad(2) + ":" + m.pad(2))
    }

    var theDate = taskInfo.date.substring(6, 10) + '-' + taskInfo.date.substring(3, 5) + '-' + taskInfo.date.substring(0, 2)

    var data = exportFsTask({
      turnpoints: turnpoints,
      taskInfo: taskInfo,
      thedate: theDate,
      UTCOffset: utcOffset,
      times: times,
      FsScoreFormula: FsScoreFormula,
      starts: starts,
      taskID: taskID,
      ss: 2,
      es: es,
    });

    var jsonTask = x2js.xml_str2json(data);


    if (jsonDB.Fs.FsCompetition.FsTasks.FsTask == undefined) {
      var empty = { FsTask: new Array };
      jsonDB.Fs.FsCompetition.FsTasks = empty;
    }

    if (jsonDB.Fs.FsCompetition.FsTasks.FsTask.length == undefined) {
      let t1 = jsonDB.Fs.FsCompetition.FsTasks.FsTask;
      let ar1 = new Array();
      ar1.push(t1);
      jsonDB.Fs.FsCompetition.FsTasks.FsTask = ar1;

    }

    jsonDB.Fs.FsCompetition.FsTasks.FsTask.push(jsonTask.FsTask);


    var xmlAsStr = '<?xml version="1.0" encoding="utf-8"?>' + (x2js.json2xml_str(jsonDB));

    var formattedXml = formatXml(xmlAsStr);

    return new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), formattedXml], { 'type': "text/xml" });
  }

  function formatXml(xml) {
    xml = xml.replace(/>(\s*)</g, ">\r\n<");
    var pad = 0;
    return xml.split(/\r\n/).map(function(node) {
      var indent = 0;
      if (node.match(/^<\/?\w[^>]*>$/)) {
        if (node.match(/^<\/\w/)) {
          pad = Math.max(pad - 1, 0);
        } else if (node.match(/^<\w[^>]*[^\/]>/)) {
          indent = 1;
        }
      }
      var padding = Array(pad + 1).join('  ');
      var line = padding + node;
      pad += indent;
      return line;
    }).join('\r\n');
  }

  return {
    'check': check,
    'exporter': exporter,
    'extension': '.fsdb',
    'name': 'FsDB',
    'parse': parse,
  }
});

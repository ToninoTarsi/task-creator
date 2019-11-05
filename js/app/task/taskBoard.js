/**
 * @file
 * Taskboard module for the task creator.
 */
define(['rejs!task/templates/taskboard', 'jquery', 'jquery-ui'], function(taskBoard, $) {
 
  $(document).on('click', '#taskboard li', function(e) {
    var index = $(this).index();
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('openMapTurnpointConfig', false, false, {
      index: index,
    });    
    document.dispatchEvent(e);
  });


  $(document).on('click', '#increase-task', function(e) {
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('changeTaskNumber', false, false, {
      forward: true,
    });    
    document.dispatchEvent(e);
  });



  $(document).on('click', '#decrease-task', function(e) {
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('changeTaskNumber', false, false, {
      forward: false,
    });    
    document.dispatchEvent(e);
  });

  

  // $(document).on('click', '#change_task_date', function(e) {
  //   $( "#change_task_date" ).datepicker({
  //     showOn: "button",
  //       buttonText: "day"
  //   });
  // });

  function makeItSortable () {
    $("#taskboard ul").sortable({
      start: function(event, ui) {
        ui.item.startIndex = ui.item.index();
      },
      stop: function(event, ui) {
        var oldIndex = ui.item.startIndex;
        var index = ui.item.index();
        var e = document.createEvent("CustomEvent");
        e.initCustomEvent('reorderTurnpoint', false, false, {
          oldIndex: oldIndex,
          index: index,
        });    
        document.dispatchEvent(e);
      }
    });
  }

  var rebuildTask = function(turnpoints, taskInfo) {
    $("#taskboard-content").html(taskBoard({
      turnpoints: turnpoints,
      taskInfo : taskInfo,
    }));

    makeItSortable();
  }

  return {
    rebuildTask: rebuildTask,
  }
})

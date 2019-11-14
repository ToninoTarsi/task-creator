/**
 * @file
 * JS starter for requirejs.
 * Performs Configuration, Dependency tracker.
 * Load the main.js entry point.
 */



/**
 * Configuration settings for requirejs.
 */
requirejs.config({
  baseUrl : "bower_components",
  urlArgs: "bust=" + (new Date()).getTime(),
  paths : {
    app : "../js/app",
    async : "requirejs-plugins/src/async",
    bootstrap : "bootstrap/dist/js/bootstrap.min",
    css: "require-css/css",
    Dropzone : "dropzone/dist/dropzone-amd-module",
    ejs : 'ejs/ejs',
    formats : '../js/app/formats', 
    jquery : "jquery/dist/jquery",
    'jquery-ui' : "../js/lib/jquery-ui-1.12.1.custom/jquery-ui",
    'jquery-qrcode' : "jquery-qrcode/jquery.qrcode.min",
    simplemodal : "../js/lib/simplemodal/jquery.simplemodal",
    rejs : 'requirejs-ejs-plugin/rejs',
    styles : "../../css",
    task : "../js/app/task",
    text : "text/text",
    tracks : "../js/app/tracks",
    waypoints : "../js/app/waypoints",
    jgrowl : "jGrowl/jquery.jgrowl.min",
    'xml-formatter': 'xml-formatter/xml-formatter'
  },
  shim : {
    simplemodal: {
      deps : ['jquery'],
    },
    bootstrap : {
      deps : ['jquery'],
    },
    ejs : {
      exports: 'ejs',
    },
    'jgrowl' : {
      deps : ['jquery'],
      exports : 'jQuery.fn.jGrowl',
    },
  },
});


/**
 * Dependency tracker for requirejs.
 *
 * @link https://gist.github.com/dustinboston/3288778
 * Methods available after page load:
 * rtree.map()
 *  - Fills out every module's map property under rtree.tree.
 *  - Print out rtree.tree in the console to see their map property.
 * rtree.toUml()
 *  - Prints out a UML string that can be used to generate UML
 *  - UML Website: http://yuml.me/diagram/scruffy/class/draw
 */
requirejs.onResourceLoad = function (context, map, depMaps) {
  if (!window.rtree) {
    window.rtree = {
      urls : [],
      tree: {},
      map: function() {
        for (var key in this.tree) {
          if (this.tree.hasOwnProperty(key)) {
            var val = this.tree[key];
            for (var i =0; i < val.deps.length; ++i) {
              var dep = val.deps[i];
              val.map[dep] = this.tree[dep];
            }
          }
        }
        return this.tree
      },
      toUml: function() {
        var uml = [];
        for (var key in this.tree) {
          if (this.tree.hasOwnProperty(key)) {
            var val = this.tree[key];
            for (var i = 0; i < val.deps.length; ++i) {
              uml.push("[" + key + "]->[" + val.deps[i] + "]");
            }
          }
        }
        return uml.join("\n");
      }
    };
  }
  
  var tree = window.rtree.tree;
  function Node() {
    this.deps = [];
    this.map = {};
  }

  if (!tree[map.name]) {
    tree[map.name] = new Node();
  }
  
  // For a full dependency tree
  if (depMaps) {
    for (var i = 0; i < depMaps.length; ++i) {
      tree[map.name].deps.push(depMaps[i].name);
    }
  }
  
  // For a simple dependency tree
  /*if (map.parentMap && map.parentMap.name) {
    if (!tree[map.parentMap.name]) {
      tree[map.parentMap.name] = new Node();
    }
    if (map.parentMap.name !== map.name) {
      tree[map.parentMap.name].deps.push(map.name);
    }
  }*/
  window.rtree.urls.push(map.url);
};

/**
 * Finally load the main app module to start the app
 */
requirejs(["app/main"]);

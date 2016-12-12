// ==UserScript==
// @id             iitc-plugin-checkpoint-stats@nobody889
// @name           IITC plugin: Show current/upcoming checkpoint stats
// @category       Info
// @version        0.2.0
// @namespace      https://github.com/lithium/iitc-plugin-checkpoint-stats
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUIsLDNAME@@-@@BUILDDATE@@] Show the remaining time until the next checkpoint.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @include        https://www.ingress.com/mission/*
// @include        http://www.ingress.com/mission/*
// @match          https://www.ingress.com/mission/*
// @match          http://www.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
//plugin_info.buildName = 'jonatkins';
//plugin_info.dateTimeVersion = '20150917.154202';
//plugin_info.pluginId = 'score-cycle-times';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////


// use own namespace for plugin
window.plugin.checkpointStats = function() {};

window.plugin.checkpointStats.CHECKPOINT = 5*60*60; //5 hours per checkpoint
window.plugin.checkpointStats.CYCLE = 7*25*60*60; //7 25 hour 'days' per cycle


window.plugin.checkpointStats.setup  = function() {
  
   if(window.useAndroidPanes()) {
    android.addPane("plugin-checkpointStats", "Checkpoint Stats", "ic_action_paste");
    addHook("mapDataRefreshStart", window.plugin.checkpointStats.fetchRegionScoreboard);
  } else {
    var style = '<style type="text/css">'
            + '.regionName { margin: 0; text-align: center; }'
            + '.scorebarHeader { margin: 25px 0 0 0; font-size: 12px; color: white; }'
            + '.scorebarHeader.nopad { margin: 3px 0 0 0; }'
            + '.scorebar span { display: block; float: left; height: 21px; line-height: 22px;}'
            + '.scorebar .res { background-color: rgb(0,86,132); text-align: left;}'
            + '.scorebar .enl { background-color: rgb(1,127,1); text-align: right;}'
            + '</style>';

  $(style).appendTo("head");

  // add a div to the sidebar, and basic style
  $('#sidebar').append('<div id="checkpoint_stats_previous"></div>');
  $('#checkpoint_stats_previous').css({'color':'#ffce00'});

  window.addHook('mapDataRefreshStart', window.plugin.checkpointStats.fetchRegionScoreboard);
  }

  $("<style>")
    .prop("type", "text/css")
    //.html("#checkpointStats.mobile {\n  background: transparent;\n  border: 0 none !important;\n  height: 100% !important;\n  width: 100% !important;\n  left: 0 !important;\n  top: 0 !important;\n  position: absolute;\n  overflow: auto;\n}\n\n#portalslist table {\n  margin-top: 5px;\n  border-collapse: collapse;\n  empty-cells: show;\n  width: 100%;\n  clear: both;\n}\n\n#checkpointStats table td, #checkpointStats table th {\n  background-color: #1b415e;\n  border-bottom: 1px solid #0b314e;\n  color: white;\n  padding: 3px;\n}\n\n#portalslist table th {\n  text-align: center;\n}\n\n#portalslist table .alignR {\n  text-align: right;\n}\n\n#portalslist table.portals td {\n  white-space: nowrap;\n}\n\n#portalslist table th.sortable {\n  cursor: pointer;\n}\n\n#portalslist table .portalTitle {\n  min-width: 120px !important;\n  max-width: 240px !important;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n\n#portalslist .sorted {\n  color: #FFCE00;\n}\n\n#portalslist table.filter {\n  table-layout: fixed;\n  cursor: pointer;\n  border-collapse: separate;\n  border-spacing: 1px;\n}\n\n#portalslist table.filter th {\n  text-align: left;\n  padding-left: 0.3em;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n#portalslist table.filter td {\n  text-align: right;\n  padding-right: 0.3em;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n#portalslist .filterNeu {\n  background-color: #666;\n}\n\n#portalslist table tr.res td, #portalslist .filterRes {\n  background-color: #005684;\n}\n\n#portalslist table tr.enl td, #portalslist .filterEnl {\n  background-color: #017f01;\n}\n\n#portalslist table tr.none td {\n  background-color: #000;\n}\n\n#portalslist .disclaimer {\n  margin-top: 10px;\n  font-size: 10px;\n}\n\n#portalslist.mobile table.filter tr {\n  display: block;\n  text-align: center;\n}\n#checkpointStats.mobile table.filter th, #checkpointStats.mobile table.filter td {\n  display: inline-block;\n  width: 22%;\n}\n\n")
    .appendTo("head");
  
};


window.plugin.checkpointStats.fetchRegionScoreboard = function() {
  var latLng = map.getCenter();
  var latE6 = Math.round(latLng.lat*1E6);
  var lngE6 = Math.round(latLng.lng*1E6);

  window.postAjax('getRegionScoreDetails', {latE6:latE6,lngE6:lngE6}, window.plugin.checkpointStats.regionScoreboardSuccess, window.plugin.checkpointStats.regionScoreboardFailure);
};

window.plugin.checkpointStats.regionScoreboardSuccess = function(result) {
  var gameScore = {
    enl: parseInt(result.result.gameScore[0]),
    res: parseInt(result.result.gameScore[1])
  };
  var lastScore = {
    checkpoint: parseInt(result.result.scoreHistory[0][0]),
    enl: parseInt(result.result.scoreHistory[0][1]),
    res: parseInt(result.result.scoreHistory[0][2])
  };

  var scorebar = function(enl, res, suffix) {
    var enlPercent = (enl / (enl + res))*100;
    var resPercent = 100 - enlPercent;
    var suffix = suffix || '';

    return '<div class="scorebar">'
           + '<span class="enl" style="width: '+enlPercent+'%">'+window.plugin.checkpointStats.muFormat(enl)+suffix+'&nbsp;</span>'
           + '<span class="res" style="width: '+resPercent+'%">&nbsp;'+window.plugin.checkpointStats.muFormat(res)+suffix+'</span>'
           + '<span style="clear: both"></span>'
         + '</div>';
  };

  var now = new Date().getTime();
  var cycleStartInt = Math.floor(now / (window.plugin.checkpointStats.CYCLE*1000)) * (window.plugin.checkpointStats.CYCLE*1000);
  var cycleEnd = new Date(cycleStartInt + window.plugin.checkpointStats.CYCLE*1000);
  var checkpointStartInt = Math.floor(now / (window.plugin.checkpointStats.CHECKPOINT*1000)) * (window.plugin.checkpointStats.CHECKPOINT*1000);
  var checkpointStart = new Date(checkpointStartInt);
  var checkpointEnd = new Date(checkpointStartInt + window.plugin.checkpointStats.CHECKPOINT*1000);

  var checkpointSince = window.plugin.checkpointStats.readableUntil(new Date(), checkpointStart);

  var html = '<p class="regionName">'+result.result.regionName+'</p>'
           + '<p class="scorebarHeader nopad">next checkpoint - '+window.plugin.checkpointStats.dateFormat(checkpointEnd)+' in '+window.plugin.checkpointStats.readableUntil(checkpointEnd)+'</p>'
           + scorebar(gameScore.enl, gameScore.res)
           + '<p class="scorebarHeader">checkpoint #'+lastScore.checkpoint+' - '+window.plugin.checkpointStats.dateFormat(checkpointStart)+' '+checkpointSince+' ago</p>'
           + scorebar(lastScore.enl, lastScore.res, ' mu')
           + '<p class="scorebarHeader">next cycle - '+window.plugin.checkpointStats.dateFormat(cycleEnd)+' in '+window.plugin.checkpointStats.readableUntil(cycleEnd)+'</p>'
           + '<p class="scorebarHeader"><a onclick="window.plugin.checkpointStats.showAllCheckPoints();return false;">Show all checkpoints in cycle</a></p>'
           ;

  $('#checkpoint_stats_previous').html(html);
};
window.plugin.checkpointStats.regionScoreboardFailure = function(result) {
};

window.plugin.checkpointStats.dateFormat = function(date) {
  var monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  var dayNames = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  ];

  var day = date.getDate();
  var dayIndex = date.getDay();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var hours = date.getHours();

  return dayNames[dayIndex]+' '+monthNames[monthIndex]+' '+day+' '+hours+':00';
};


window.plugin.checkpointStats.readableUntil = function(date, whence) {
  var whence = whence || new Date();

  var duration = (date.getTime() - whence.getTime()) / 1000;

  if (duration > 86400) {
    return Math.floor(duration/86400)+ ' days';
  }
  else if (duration > 3600) {
    return '<'+Math.ceil(duration/3600)+ ' hours';
  }
  else {
    return Math.floor(duration/60)+ ' minutes';
  }

};

window.plugin.checkpointStats.muFormat = function(score) {
  if (score > 1000000) {
    return (score/1000000).toFixed(1)+'M';
  }
  else if (score > 1000) {
    return (score/1000).toFixed(1)+'k';
  }
  return score;
};

window.plugin.checkpointStats.showAllCheckPoints = function() {
  var now = new Date().getTime();

  var ts = Math.floor(now / (7*25*60*60*1000)) * (7*25*60*60*1000);

  var html = '<div>';
    var oldDat = "";
    var oldtime = "";
    for (var i=0;i<36;i++) {
        var tsStr = unixTimeToString(ts,true).replace(/:00$/,'');
        var currDat = tsStr.substring(0, 10);
        var currTime = tsStr.substring(11, 16).replace(/00:$/,'00');
        if (oldDat != currDat) {
            if (oldDat !== "") {
                html = html.substring(0, html.length-9) + '</span> ]' + "<br/>";
            }
            html += '<span style="color:#bbbbbb">' + currDat + ' [' + "</span> ";
            oldDat = currDat;
        }
        if (ts < now) {
           html += '<span style="color:#999999">' + currTime + ', </span>';
        } else {
           html += '<span style="color:rgb(255,206,0)">' + currTime + ', </span>';
        }
        oldtime = currDat;
        ts += 5*60*60*1000;
    }
    html =  html.substring(0, html.length-9) + '</span> ]' + '</div>';

  dialog({
    html: html,
    dialogClass: 'ui-dialog-checkpointStats',
    title: 'All checkpoints in cycle'
  });
};




var setup =  window.plugin.checkpointStats.setup;

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

// ==UserScript==
// @id             iitc-plugin-score-cycle-times@jonatkins
// @name           IITC plugin: Show Scoreboard Cycle/All Checkpoint Times
// @category       Info
// @version        0.1.1.20161103.103902
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://secure.jonatkins.com/iitc/release/plugins/score-cycle-times.meta.js
// @downloadURL    https://secure.jonatkins.com/iitc/release/plugins/score-cycle-times.user.js
// @description    Show the times used for the septicycle and checkpoints for regional scoreboards.
// @include        https://www.ingress.com/intel*
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'jonatkins';
plugin_info.dateTimeVersion = '20150917.154202';
plugin_info.pluginId = 'score-cycle-times';
//END PLUGIN AUTHORS NOTE


// PLUGIN START ////////////////////////////////////////////////////////


// use own namespace for plugin
window.plugin.scoreCycleTimes = function() {};

window.plugin.scoreCycleTimes.CHECKPOINT = 5*60*60; //5 hours per checkpoint
window.plugin.scoreCycleTimes.CYCLE = 7*25*60*60; //7 25 hour 'days' per cycle


window.plugin.scoreCycleTimes.setup  = function() {

  // add a div to the sidebar, and basic style
  $('#sidebar').append('<div id="score_cycle_times_display"></div>');
  $('#score_cycle_times_display').css({'color':'#ffce00'});


  window.plugin.scoreCycleTimes.update();
};

window.plugin.scoreCycleTimes.formatTime = function(time) {
    var timeStr = unixTimeToString(time,true);
    timeStr = timeStr.replace(/:00$/,''); //FIXME: doesn't remove seconds from AM/PM formatted dates
    return timeStr;
};

window.plugin.scoreCycleTimes.showAllCheckPoints = function() {
  var now = new Date().getTime();

  var ts = Math.floor(now / (window.plugin.scoreCycleTimes.CYCLE*1000)) * (window.plugin.scoreCycleTimes.CYCLE*1000);

  var html = '<div>';
    var oldDat = "";
    var oldtime = "";
    for (var i=0;i<36;i++) {
        var tsStr = window.plugin.scoreCycleTimes.formatTime(ts);
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
        ts += window.plugin.scoreCycleTimes.CHECKPOINT*1000;
    }
    html =  html.substring(0, html.length-9) + '</span> ]' + '</div>';

  dialog({
    html: html,
    dialogClass: 'ui-dialog-scoreCycleTimes',
    title: 'All checkpoints in cycle'
  });
};

window.plugin.scoreCycleTimes.update = function() {

  // checkpoint and cycle start times are based on a simple modulus of the timestamp
  // no special epoch (other than the unix timestamp/javascript's 1970-01-01 00:00 UTC) is required

  // when regional scoreboards were introduced, the first cycle would have started at 2014-01-15 10:00 UTC - but it was
  // a few checkpoints in when scores were first added

  var now = new Date().getTime();

  var cycleStart = Math.floor(now / (window.plugin.scoreCycleTimes.CYCLE*1000)) * (window.plugin.scoreCycleTimes.CYCLE*1000);
  var cycleEnd = cycleStart + window.plugin.scoreCycleTimes.CYCLE*1000;

  var checkpointStart = Math.floor(now / (window.plugin.scoreCycleTimes.CHECKPOINT*1000)) * (window.plugin.scoreCycleTimes.CHECKPOINT*1000);
  var checkpointEnd = checkpointStart + window.plugin.scoreCycleTimes.CHECKPOINT*1000;


  var formatRow = function(label,time) {
    var timeStr = unixTimeToString(time,true);
    timeStr = timeStr.replace(/:00$/,''); //FIXME: doesn't remove seconds from AM/PM formatted dates

    return '<tr><td>'+label+'</td><td>'+timeStr+'</td></tr>';
  };

  var html = '<table>'
           + formatRow('Next checkpoint', checkpointEnd)
           + formatRow('Cycle end', cycleEnd)
           + '<tr><td colspan="2"><a onclick="window.plugin.scoreCycleTimes.showAllCheckPoints();return false;">Show all checkpoints in cycle</a></td></tr>'
           + '</table>';

  $('#score_cycle_times_display').html(html);

  setTimeout ( window.plugin.scoreCycleTimes.update, checkpointEnd-now);
};

var setup =  window.plugin.scoreCycleTimes.setup;

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
// ==UserScript==
// @id portalLonLat
// @name IITC Plugin: Portal Lon/Lat
// @category Misc
// @version 0.0.23
// @namespace http://www.renevlugt.nl/iitc-plugins/portal-report
// @description Gives you a Copy-Paste ready summary of the portal with Intel, G-maps and Apple Maps link
// @downloadURL https://www.renevlugt.nl/iitc-plugins/portal-lonlat.user.js
// @updateURL   https://www.renevlugt.nl/iitc-plugins/portal-lonlat.meta.js
// @author Vashiru
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @include        https://ingress.com/intel*
// @include        http://ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @match          https://ingress.com/intel*
// @match          http://ingress.com/intel*
// @grant          none
// ==/UserScript==


// Wrapper function that will be stringified and injected
// into the document. Because of this, normal closure rules
// do not apply here.
function wrapper(plugin_info) {
  // Make sure that window.plugin exists. IITC defines it as a no-op function,
  // and other plugins assume the same.
  if (typeof window.plugin !== 'function') window.plugin = function() {};

  // Use own namespace for plugin
  window.plugin.portalLonLat = function() {};

  // Name of the IITC build for first-party plugins
  plugin_info.buildName = 'portalLonLat';

  // Datetime-derived version of the plugin
  plugin_info.dateTimeVersion = '20150829103500';

  // ID/name of the plugin
  plugin_info.pluginId = 'portalLonLat';

  // The entry point for this plugin.
  function setup() {
    var notifcationCSS = '.ps-notification{width:200px;height:20px;height:auto;position:absolute;left:50%;margin-left:-100px;top:20px;z-index:10000;background-color: #383838;color: #F0F0F0;font-family: Calibri;font-size: 20px;padding:10px;text-align:center;border-radius: 2px;-webkit-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);-moz-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);}';
    $('head').append("<style>" + notifcationCSS + "</style>");
    $('body').append("<div class='ps-notification' style='display:none'>Portal Lon/Lat Copied</div>");
    window.addHook('portalDetailsUpdated', window.plugin.portalLonLat.addToSidebar);
  }

  window.plugin.portalLonLat.addToSidebar = function() {
    $('.linkdetails').append('<aside><a id="portal-lonlat">Portal Lon/Lat</a></aside>');
    $('#portal-lonlat').on('click', function() {
      window.plugin.portalLonLat.portalLonLat(window.selectedPortal);
    });
  };

  // Future functionality
  window.plugin.portalLonLat.portalLonLat = function(guid) {

    var portalDetails = portalDetail.get(guid);

    var p_name = $('#portaldetails .title').text();
    var p_level = portalDetails.level;
    var p_range = $('#randdetails').find('a').text();
    var p_capturedBy = portalDetails.owner;
    var p_faction = "none";

    if(portalDetails.team == "E"){
      p_faction = "enl";
    } else if (portalDetails.team == "R") {
      p_faction = "res";
    } else {
      p_faction = "neutral";
      p_level = 0;
    }

    var p_latE6 = portalDetails.latE6;
    var p_lngE6 = portalDetails.lngE6;

    var mod = portalDetails.mods;
    var modText ='';

    if (mod){
      for(var i = 0; i < 4; i++) {
        if (mod[i] !== null) {
          if (mod[i].name == 'Multi-hack') {mod[i].name='MH';}
          if (mod[i].name == 'SoftBank Ultra Link') {mod[i].name='SBUL'; mod[i].rarity='';}
          if (mod[i].name == 'AXA Shield') {mod[i].name='AXA'; mod[i].rarity='';}
          if (mod[i].name == 'Heat Sink') {mod[i].name='HS';}
          if (mod[i].name == 'Portal Shield') {mod[i].name='S';}
          if (mod[i].name == 'Link Amp') {mod[i].name='LA';}
          if (mod[i].name == 'Force Amp') {mod[i].name='FA'; mod[i].rarity='';}
          if (mod[i].name == 'Turret') {mod[i].name='T'; mod[i].rarity='';}
          if (mod[i].rarity == 'VERY_RARE') {mod[i].rarity='VR';}
          if (mod[i].rarity == 'RARE') {mod[i].rarity='R';}
          if (mod[i].rarity == 'COMMON') {mod[i].rarity='C';}
          modText += mod[i].rarity + "" + mod[i].name;
          modText += ", ";
        }
        else {
          continue;
        }
      }
      modText = modText.trim().slice(0, -1);
      if(modText === ""){
        modText = "none";
      }
    }

    var portalLonLatText = '';
    /*portalLonLatText += 'Portal name: ' + p_name + '\n';
    portalLonLatText += 'Portal level: ' + p_level + ' (' + p_range + ')' + '\n';
    portalLonLatText += 'Captured by: ' + p_capturedBy + ' (' + p_faction + ')\n';
    portalLonLatText += 'Mods: ' + modText + '\n';

    portalLonLatText += 'Intel: https://www.ingress.com/intel?ll=' + p_latE6 / 1E6 + ',' + p_lngE6 / 1E6 + '&z=17&pll=' + p_latE6 / 1E6 + ',' + p_lngE6 / 1E6 + '\n';
    portalLonLatText += 'Apple Maps: ' + 'http://maps.apple.com/?q=' + p_latE6 / 1E6 + ',' + p_lngE6 / 1E6+ '\n';
    portalLonLatText += 'Waze: ' + 'http://waze.to/?navigate=yes&ll=' + p_latE6 / 1E6 + ',' + p_lngE6 / 1E6 + '\n';
    portalLonLatText += 'Google Maps: ' + 'http://maps.google.com/?q=' + p_latE6 / 1E6 + ',' + p_lngE6 / 1E6;*/
    portalLonLatText += p_latE6 / 1E6 + ',' + p_lngE6 / 1E6;
    $('body').append('<textarea class="portal-lonlat-textarea">' + portalLonLatText + '</textarea>');
    $('.portal-lonlat-textarea').select();
    document.execCommand('copy');
    $('.portal-lonlat-textarea').remove();
    $('.ps-notification').fadeIn(400).delay(3000).fadeOut(400);
  };

  // Add an info property for IITC's plugin system
  setup.info = plugin_info;

  // Make sure window.bootPlugins exists and is an array
  if (!window.bootPlugins) window.bootPlugins = [];
  // Add our startup hook
  window.bootPlugins.push(setup);
  // If IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup();
}


// Create a script element to hold our content script
var script = document.createElement('script');
var info = {};

// GM_info is defined by the assorted monkey-themed browser extensions
// and holds information parsed from the script header.
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}

// Create a text node and our IIFE inside of it
var textContent = document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ')');
// Add some content to the script element
script.appendChild(textContent);
// Finally, inject it... wherever.
(document.body || document.head || document.documentElement).appendChild(script);
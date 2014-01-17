/*
Copyright (c) 2013 Sano Webdevelopment

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

-

Modified by: miguel[at]miguellopes.net 
Description: this script is a modified version of a XBMC addon for firefox.

*/
var Request = require("sdk/request").Request;
var prefs = require("sdk/simple-prefs").prefs;
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var panel;
var extensoes = { "mp4":1, "mkv":1, "mp3":1, "mpg":1, "ogg":1, "ogv":1, "mov":1, "avi":1, "asf":1, "wmv":1, "ts":1, "trp":1, "vob":1, "m2t":1, "m2ts":1, "mts":1, "m2p":1, "m1v":1, "m4v":1, "wma":1, "flac":1, "acc":1, "wma":1, "jpg":1, "jpeg":1, "bmp":1, "png":1, "gif":1 };
exports.main = function() {
    var cm = require("sdk/context-menu");
    cm.Item({
      label: "Send to NMT",
      context: cm.SelectorContext('a[href*=".mp4"],a[href*=".mkv"],a[href*=".mp3"],a[href*=".mpg"],a[href*=".ogg"],a[href*=".ogv"],a[href*=".mov"],a[href*=".avi"],a[href*=".asf"],a[href*=".wmv"],a[href*=".ts"],a[href*=".trp"],a[href*=".vob"],a[href*=".m2t"],a[href*=".m2ts"],a[href*=".mts"],a[href*=".m2p"],a[href*=".m1v"],a[href*=".m4v"],a[href*=".wma"],a[href*=".flac"],a[href*=".acc"],a[href*=".wma"],a[href*=".jpg"],a[href*=".jpeg"],a[href*=".bmp"],a[href*=".png"],a[href*=".gif"]'),
      contentScript: 'self.on("click", function (node, data) {' +
                 ' self.postMessage({url:node.href,pathname:node.pathname});' +
                 '});',
      onMessage: function(data) {
         parseUrl(data.url,data.pathname);
      }
    });    
    pageMod.PageMod({
      include: "*.youtube.com",
      contentScriptFile: data.url("youtube.js"),
	  contentScriptWhen:"end",
      onAttach: function(worker) {
      	var url = "";
      	console.log("Comecar")
       
		console.log("getlink emitido")
       
        worker.port.on("openurl", function(url) {
        	if(url !== "")
	            parseUrl(url,'youtube');
            else
            	displayMessage('Error','No link Found '+url,'error');
        });
		worker.port.emit('GetLink',data.url('nmt.png'));
      }
    });
};
function displayMessage(title,message,type){
    if(panel){
        console.log('panel exists');
        panel.show();
        panel.port.emit("showtext",{'title':title,'message':message,'type':type});        
    }else{
        panel = require("sdk/panel").Panel({
          width: 400,
          height: 100,
          contentURL: data.url('dialog.html'),
          contentScriptFile: data.url("listener.js"),
          onHide: function(){
            panel.destroy();
            panel = null;
          },
          onShow: function(){
              panel.port.emit("showtext",{'title':title,'message':message,'type':type});
          }
        }).show();
    }
}
function parseUrl(url,pathname){

	if(pathname=="youtube"){
		sendToNMT(url+"#.mp4");
	}

    var ext = pathname.split('.').pop();
    //Supported extensions
    if(extensoes[ext] == 1){
        sendToNMT(url);
        return;
    }
    displayMessage('Error','The following url is not supported: '+url,'error');
}

function sendToNMT(fileurl){
    if(!prefs.xbmcip || prefs.xbmcip == ''){
        displayMessage('Error','You have to set up your NMT address first in the Addon Settings','error');
        return false;
    }
    var xbmcport = prefs.xbmcport;
    
    rurl = 'http://'+prefs.xbmcip+':'+xbmcport+'/MediaRenderer_AVTransport/control';//'+prefs.xbmcip+'
   
    var hders = {};
    hders['SOAPACTION']='"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"';
	hders['Cache-Control']="";
	hders['DNT']="";
	hders['Connection']="";
	hders['Pragma']="";
	hders['Accept-Encoding']="";
	hders['Accept-Language']="";
	hders['Accept']="";
	
	
    displayMessage('Sending','Sending to NMT...','info');
    Request({
        url:rurl,
        content:'<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body> <u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">  <InstanceID>0</InstanceID><CurrentURIMetaData></CurrentURIMetaData><CurrentURI>'+fileurl+'</CurrentURI> </u:SetAVTransportURI> </s:Body> </s:Envelope>',
        contentType:'text/xml; charset="utf-8"',
        headers: hders,
        onComplete: function(resp){
            console.log(resp.status);
            if(resp.status == 200){
				displayMessage('Success','Sent to NMT','ok');
				return;
            }
            if(resp.status == 0){
                displayMessage('Network error','Could not contact NMT. Check your configuration.','error');
                return;
            }
            displayMessage('Status error '+resp.status,'Could not contact NMT. Check your configuration. HTTP Status: '+resp.status+' '+resp.statusText+'<br />Details logged to console','error');
            console.log(resp.text);
            return;
        }
    }).post();
}
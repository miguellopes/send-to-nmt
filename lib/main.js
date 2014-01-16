/*
Copyright (c) 2013 Sano Webdevelopment

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Request = require("sdk/request").Request;
var prefs = require("sdk/simple-prefs").prefs;
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var panel;
exports.main = function() {
    var cm = require("sdk/context-menu");
    cm.Item({
      label: "Send to NMT",
      context: cm.SelectorContext('a[href*="youtu"],a[href^="/watch"],a[href*=".mp4"],a[href*=".mkv"],a[href*=".mp3"],a[href*=".pls"]'),
      image: data.url('xbmc_logo.ico'),
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
            	displayMessage('Error','sem link '+url,'error');
        });
		worker.port.emit('GetLink');
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
		sendToXBMC(url);
	}
	/*
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).;
    var match = url.match(regExp);
    if (match&&match[2].length==11){
        sendYouTube(match[2]);
        return;
    }
    var regExp2 = /^.*(youtube.com\/watch.*[\?\&]v=)([^#\&\?]*).;
    var match = url.match(regExp2);
    if (match&&match[2].length==11){
        sendYouTube(match[2]);
        return;
    }
    */
    var ext = pathname.split('.').pop();
    //Supported extensions
    if(['mp4'].indexOf(ext) >= 0){
        sendToXBMC(url);
        return;
    }
    displayMessage('Error','The following url is not supported: '+url,'error');
}
function sendYouTube(){
	
    sendToXBMC(url);
}
function sendToXBMC(fileurl){
   /* if(!prefs.xbmcip || prefs.xbmcip == ''){
        displayMessage('Error','You have to set up your XBMC address first in the Addon Settings','error');
        return false;
    }*/
    var xbmcport = 6357;//prefs.xbmcport;
   // if(!prefs.xbmcport || prefs.xbmcport == '' || isNaN(parseInt(prefs.xbmcport)) || parseInt(prefs.xbmcport) == 0) xbmcport = '80';
    if(prefs.xbmcuser && prefs.xbmcuser != ''){
        rurl = 'http://'+prefs.xbmcuser+':'+prefs.xbmcpass+'@'+prefs.xbmcip+':'+xbmcport+'/jsonrpc';
    }else{
        rurl = 'http://192.168.0.9:'+xbmcport+'/MediaRenderer_AVTransport/control';//'+prefs.xbmcip+'
    }
    var hders = {};//,'Content-Type', 'text/xml; charset="utf-8"'
    hders['SOAPACTION']='"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"';
    console.log(rurl);//APAGAR
    displayMessage('Sending','Sending to XBMC...','info');
    Request({
        url:rurl,
        content:'<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body> <u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">  <InstanceID>0</InstanceID><CurrentURIMetaData></CurrentURIMetaData><CurrentURI>'+fileurl+'#.mp4</CurrentURI> </u:SetAVTransportURI> </s:Body> </s:Envelope>',
        contentType:'text/xml; charset="utf-8"',
        headers: hders,
        onComplete: function(resp){
            console.log(resp.status);
            if(resp.status == 200){
            	alert("Parece que Resultou")
                if(resp.json && resp.json.result){
                    if(resp.json.result == 'OK'){
                        displayMessage('Success','Sent to XBMC','ok');
                        return;
                    }
                }
                if(resp.json.error){
                    if(resp.json.error.data.stack.message){
                        displayMessage('XBMC Error '+resp.json.error.code,'XBMC reported: '+resp.json.error.data.stack.message+'<br />Details logged to console','error');
                        console.log(resp.text);
                        return;
                    }
                    displayMessage('XBMC Error ','XBMC reported error code '+resp.json.error.code+'<br />Details logged to console','error');
                    console.log(resp.text);
                    return;
                }
            }
            if(resp.status == 0){
                displayMessage('Network error','Could not contact XBMC. Check your configuration.','error');
                return;
            }
            displayMessage('Status error '+resp.status,'Could not contact XBMC. Check your configuration. HTTP Status: '+resp.status+' '+resp.statusText+'<br />Details logged to console','error');
            console.log(resp.text);
            return;
        }
    }).post();
}

self.port.on("injectSendButton", function(imagesrc, url) {
	console.log("OLA1");
//   var addto = document.getElementById('');
//   if(addto){
//      var targets = document.querySelector('#watch-related li');
//       var ouritem = document.createElement('li');
//       ouritem.className = 'video-list-item';
//       ouritem.appendChild(document.createTextNode('Send to'));
//       ouritem.appendChild(document.createElement('br'));
//       var a = document.createElement('a');
//       a.href = "#";
//       a.title = 'Send to NMT';
//       a.onclick = function(){
//           self.port.emit('openurl',url);
//           return false;
//       }
//       var image = document.createElement('img');
//       image.src = imagesrc;
//       image.alt = 'Send to NMT';
//       a.appendChild(image);
//       ouritem.appendChild(a);
//       addto.insertBefore(ouritem,targets);
//   }
});

self.port.on("GetLink", function(imagesrc) {
var addto = document.getElementById('watch-related');
if(addto){
	var videoID, videoFormats, videoAdaptFormats, videoManifestURL, scriptURL=null;
console.log("A Emitir");
//	console.log(window.getP);

	var args=null;
	var usw=(typeof this.unsafeWindow !== 'undefined')?this.unsafeWindow:window; // Firefox, Opera<15
	if (usw.ytplayer && usw.ytplayer.config && usw.ytplayer.config.args) {
		args=usw.ytplayer.config.args;
	}
	else
		console.log("Falhou a apanhar o ytplayer por js");
		
	if (args) {
    //videoID=args['video_id'];
   // videoFormats=args['url_encoded_fmt_stream_map'];
    	videoAdaptFormats=args['adaptive_fmts'];
   // videoManifestURL=args['dashmpd'];
		console.log('DYVAM - Info: Standard mode. videoAdaptFormats '+(videoAdaptFormats?videoAdaptFormats:'none')+'; ');
	}
	else
		console.log(window.ytplayer);
	if (usw.ytplayer && usw.ytplayer.config && usw.ytplayer.config.assets) {
    	scriptURL=usw.ytplayer.config.assets.js;
	}  
       
	if (videoAdaptFormats==null) { // if all else fails
    	var bodyContent=document.body.innerHTML;  
    	console.log(bodyContent);
	    if (bodyContent!=null) {
    		//  videoID=findMatch(bodyContent, /\"video_id\":\s*\"([^\"]+)\"/);
		    //  videoFormats=findMatch(bodyContent, /\"url_encoded_fmt_stream_map\":\s*\"([^\"]+)\"/);
    		videoAdaptFormats=bodyContent.match(/\"adaptive_fmts\":\s*\"([^\"]+)\"/);
			//  videoManifestURL=findMatch(bodyContent, /\"dashmpd\":\s*\"([^\"]+)\"/);
   /*   		if (scriptURL==null) {
        		scriptURL=bodyContent.match( /\"js\":\s*\"([^\"]+)\"/);
				scriptURL=scriptURL.replace(/\\/g,'');
			}     */ 
		}
		console.log('DYVAM - Info: Brute mode. videoAdaptFormats '+(videoAdaptFormats?videoAdaptFormats:'none')+'; ');
	}
  
	console.log('DYVAM - Info: url '+window.location.href+'; useragent '+window.navigator.userAgent);  
  
	if (videoAdaptFormats==null) {
		console.log('DYVAM - Error: No config information found. YouTube must have changed the code.');
		return;
	}
	sep2=(videoAdaptFormats.indexOf('&')>-1)?'&':'\\u0026'; 
	var formatos = videoAdaptFormats.split(",");
	var elem = formatos[0].split(sep2);
	var videoFormatsPair=new Array();
    var url ="";  
    for (var j=0;j<elem.length;j++) {
		var pair=elem[j].split("=");
		if (pair.length==2) {
      		if(pair[0]=="url"){
				url = unescape(pair[1]);
				break;
      		}
        //videoFormatsPair[pair[0]]=pair[1];
		}
    }
  	console.log("AKI VAI ",url);


	var addto = document.getElementById('watch-related');
	if(addto){
		var targets = document.querySelector('#watch-related li');
		var ouritem = document.createElement('li');
		ouritem.className = 'video-list-item';
		ouritem.appendChild(document.createTextNode('Send to'));
		ouritem.appendChild(document.createElement('br'));
		var a = document.createElement('a');
		a.href = "#";
		a.title = 'Send to NMT';
		a.onclick = function(){
			self.port.emit('openurl',url);
			return false;
		}
		var image = document.createElement('img');
		image.src = imagesrc;
		image.alt = 'Send to NMT';
		a.appendChild(image);
		ouritem.appendChild(a);
		addto.insertBefore(ouritem,targets);
	}

}
});



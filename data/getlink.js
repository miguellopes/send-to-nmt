self.port.on("GetLink", function(imagesrc) {
  	
  	 var videoID, videoFormats, videoAdaptFormats, videoManifestURL, scriptURL=null;
	 
	 var args=null;
  var usw=(typeof this.unsafeWindow !== 'undefined')?this.unsafeWindow:window; // Firefox, Opera<15
  if (usw.ytplayer && usw.ytplayer.config && usw.ytplayer.config.args) {
    args=ytplayer.config.args;
  }
  if (args) {
    //videoID=args['video_id'];
   // videoFormats=args['url_encoded_fmt_stream_map'];
    videoAdaptFormats=args['adaptive_fmts'];
   // videoManifestURL=args['dashmpd'];
    debug('DYVAM - Info: Standard mode. videoID '+(videoID?videoID:'none')+'; ');
  }
  if (usw.ytplayer && usw.ytplayer.config && usw.ytplayer.config.assets) {
    scriptURL=usw.ytplayer.config.assets.js;
  }  
       
  if (videoID==null) { // if all else fails
    var bodyContent=document.body.innerHTML;  
    if (bodyContent!=null) {
    //  videoID=findMatch(bodyContent, /\"video_id\":\s*\"([^\"]+)\"/);
    //  videoFormats=findMatch(bodyContent, /\"url_encoded_fmt_stream_map\":\s*\"([^\"]+)\"/);
      videoAdaptFormats=findMatch(bodyContent, /\"adaptive_fmts\":\s*\"([^\"]+)\"/);
    //  videoManifestURL=findMatch(bodyContent, /\"dashmpd\":\s*\"([^\"]+)\"/);
      if (scriptURL==null) {
        scriptURL=findMatch(bodyContent, /\"js\":\s*\"([^\"]+)\"/);
        scriptURL=scriptURL.replace(/\\/g,'');
      }      
    }
    debug('DYVAM - Info: Brute mode. videoID '+(videoID?videoID:'none')+'; ');
  }
  
  debug('DYVAM - Info: url '+window.location.href+'; useragent '+window.navigator.userAgent);  
  
  if (videoID==null || videoFormats==null || videoID.length==0 || videoFormats.length==0) {
   debug('DYVAM - Error: No config information found. YouTube must have changed the code.');
   return;
  }
  sep2=(videoAdaptFormats.indexOf('&')>-1)?'&':'\\u0026'; 
  var formatos = videoAdaptFormats.split(",");
  var elem = formatos[0].split(sep2);
  var videoFormatsPair=new Array();
    var url ="";  
    for (var j=0;j<elem.length;j++) {
      var pair=formatos.split("=");
      if (pair.length==2) {
      	if(pair[0]=="url"){
      		url = unescape(pair[1]);
			break;
      	}
        //videoFormatsPair[pair[0]]=pair[1];
      }
    }

  	
});

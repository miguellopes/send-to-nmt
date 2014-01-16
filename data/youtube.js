self.port.on("GetLink", function(imagesrc) {
var addto = document.getElementById('watch-related');
if(addto){
	var videoAdaptFormats;

	var args=null;
	var usw=(typeof this.unsafeWindow !== 'undefined')?this.unsafeWindow:window; // Firefox, Opera<15
	if (usw.ytplayer && usw.ytplayer.config && usw.ytplayer.config.args) {
		args=usw.ytplayer.config.args;
	}
		
	if (args) {
    	videoAdaptFormats=args['adaptive_fmts'];
		console.log('DYVAM - Info: Standard mode. videoAdaptFormats '+(videoAdaptFormats?videoAdaptFormats:'none')+'; ');
	}
       
	if (videoAdaptFormats==null) { // if all else fails
    	var bodyContent=document.body.innerHTML;  
	    if (bodyContent!=null) {
    		videoAdaptFormats=bodyContent.match(/\"adaptive_fmts\":\s*\"([^\"]+)\"/);
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
		}
    }

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
});



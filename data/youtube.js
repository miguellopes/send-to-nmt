self.port.on("GetLink", function(imagesrc) {

/*
18 - mp4 270p/360p
22 - mp4 720p
82 - mp4 360p (3D)
83 - mp4 240p (3D)
84 - mp4 720p (3D)
85 - mp4 1080p (3D)
133 - mp4 240p
134 - mp4 360p
135 - mp4 480p
136 - mp4 720p
137 - mp4 1080p
160 - mp4 144p
264 - mp4 1440p
92 - mp4 240p (Live)
93 - mp4 360p (Live)
94 - mp4 480p (Live)
95 - mp4 720p (Live)
96 - mp4 1080p (Live)
132 - mp4 240p (Live)
151 - mp4 72p (Live)
139 - mp4 audio 48kbits
140 - mp4 audio 128kbits
141 - mp4 audio 256kbits
*/
yitag = {
"18":"270p/360p",
"22":"720p",
"82":"360p (3D)",
"83":"240p (3D)",
"84":"720p (3D)",
"85":"1080p (3D)",
"133":"240p",
"134":"360p",
"135":"480p",
"136":"720p",
"137":"1080p",
"160":"144p",
"164":"1440p",
"92":"240p (Live)",
"93":"360p (Live)",
"94":"480p (Live)",
"95":"720p (Live)",
"96":"1080p (Live)",
"132":"240p (Live)",
"151":"72p (Live)",
"139":"Audio 48kbits",
"140":"Audio 128kbits",
"141":"Audio 256kbits"};

var addto = document.getElementById('watch-related');
if(addto){
	var videoAdaptFormats, videoFormats;

	var args=null;
	var usw=(typeof this.unsafeWindow !== 'undefined')?this.unsafeWindow:window; // Firefox, Opera<15
	if (usw.ytplayer && usw.ytplayer.config && usw.ytplayer.config.args) {
		args=usw.ytplayer.config.args;
	}
		
	if (args) {
    	videoAdaptFormats=args['url_encoded_fmt_stream_map'];
		videoFormats=args['adaptive_fmts'];
		console.log('DYVAM - Info: Standard mode. videoAdaptFormats '+(videoAdaptFormats?videoAdaptFormats:'none')+'; ');
	}
       
	if (videoAdaptFormats==null) { // if all else fails
    	var bodyContent=document.body.innerHTML;  
	    if (bodyContent!=null) {
    		videoAdaptFormats=bodyContent.match(/\"url_encoded_fmt_stream_map\":\s*\"([^\"]+)\"/);
    		videoFormats=bodyContent.match(/\"adaptive_fmts\":\s*\"([^\"]+)\"/);
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
	if(videoFormats !== undefined)
		formatos.concat(videoFormats.split(","))

	var emissoes = {};
	var videoFormatsPair=new Array();
    var url ="";
    var itag = "";
    var finali = {};
    var signature ="";
    for (var i=0;i<formatos.length;i++)  {
		var elem = formatos[i].split(sep2);
	    for (var j=0;j<elem.length;j++) {

			var pair=elem[j].split("=");
			if (pair.length==2) {
				console.log(pair[0],pair[1]);
				if(pair[0]== "sig") {
					signature = pair[1];
				}
				if(pair[0]=="itag") {

					if(pair[1] in yitag){
						console.log("GOOD: "+yitag[pair[1]]);
						itag = pair[1];
						continue;
					}
					else {
						console.log("BAD: "+pair[1]);
						break;
					}
					
				}
      			if(pair[0]=="url"){
      				
					url = unescape(unescape(pair[1])) + "&signature="+signature;
					if(url.indexOf("itag=")>0){
						console.log("A Procurar Itag..")
						temp = url.match(/&itag=([0-9]+)&/g)[1];
						if(temp in yitag) {
							itag =temp;
							console.log(itag+" "+yitag[itag]);
						}
						else {
								console.log("BAD: "+itag);
						}
					}
					else {
						console.log("SEM ITAG !!!!!");
					}
					
						console.log(url);
						finali[itag] = url;
						itag = "";
						signature="";
						break;
    	  		}
			}
	    }
	}

		var targets = document.querySelector('#watch-related li');
		var ouritem = document.createElement('li');
		ouritem.className = 'video-list-item';
		ouritem.appendChild(document.createTextNode('Send to'));
		ouritem.appendChild(document.createElement('br'));

		var select = document.createElement('select');
		select.id="link_nmt";
		for(var link in finali){
			var opt = document.createElement('option');
		    opt.value = finali[link];
		    opt.innerHTML = yitag[link];
		    select.appendChild(opt);
		}
		var a = document.createElement('a');
		a.href = "#";
		a.title = 'Send to NMT';
		a.onclick = function(){
			var u=document.getElementById("link_nmt");

			self.port.emit('openurl', u.options[u.selectedIndex].value);
			return false;
		}
		var image = document.createElement('img');
		image.src = imagesrc;
		image.alt = 'Send to NMT';
		a.appendChild(image);
		ouritem.appendChild(a);
		ouritem.appendChild(document.createElement('br'));
		ouritem.appendChild(select);
		addto.insertBefore(ouritem,targets);

}
});



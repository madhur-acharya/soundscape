console.log("%cpopup running!!!", "color: purple");
var flag= false;
document.getElementById("alias").addEventListener("click", click_input, false);
document.getElementById("upload").addEventListener("change", process_files);
document.getElementById("play").addEventListener("click", controler);
document.getElementById("pause").addEventListener("click", controler);
document.getElementById("stop").addEventListener("click", controler);
document.getElementById("randomize").addEventListener("click", controler);
document.getElementById("next").addEventListener("click", controler);
document.getElementById("previous").addEventListener("click", controler);
document.getElementById("mute").addEventListener("click", controler);
document.getElementById("reset").addEventListener("click", controler);

document.getElementById("dropdown").addEventListener("click", function(){
	document.getElementById("fake_button").click(); 
	if(flag == false)
		setTimeout(function(){document.getElementById("dropdown").src= "resources/pullup.png";}, 500);
	else
		setTimeout(function(){document.getElementById("dropdown").src= "resources/dropdown.png";}, 500);
	flag= !flag;
});	

var background= chrome.extension.getBackgroundPage();
function click_input()
{
	console.log("file upload initiated!"); 
	document.getElementById("song").innerHTML= "loading...";
	document.getElementById("upload").click();
}
update({status: "initialized?"});

function controler(evt)
{
	switch(evt.target.id)
	{
		case("play"):
		{
			document.getElementById("play").classList.add("hide");
			document.getElementById("pause").classList.remove("hide");
			update({status: "play"});
			console.log('%c' + "requesting to play...", "color: darkorange");
			break;
		}
		case("pause"):
		{
			document.getElementById("play").classList.remove("hide");
			document.getElementById("pause").classList.add("hide");
			update({status: "pause"});
			console.log('%c' + "requesting to pause..." , "color: darkorange");
			break;
		}
		case("stop"):
		{
			update({status: "stop"});
			console.log('%c' + "requesting to stop..." , "color: darkorange");
			break;
		}
		case("next"):
		{
			update({status: "next"});
			console.log('%c' + "requesting to play next song..." , "color: darkorange");
			break;
		}
		case("previous"):
		{
			update({status: "previous"});
			console.log('%c' + "requesting to play previous song..." , "color: darkorange");
			break;
		}
		case("randomize"):
		{
			document.getElementById("randomize").classList.toggle("random");
			update({status: "randomize"});
			break;
		}
		case("mute"):
		{
			update({status: "mute"});
			document.getElementById("mute").src= "resources/mute.svg";
			document.getElementById("mute").id= "unmute";
			document.getElementById("unmute").addEventListener("click", controler);
			break;
		}
		case("unmute"):
		{
			update({status: "unmute"});
			document.getElementById("unmute").src= "resources/unmute.svg";
			document.getElementById("unmute").id= "mute";
			break;
		}
		case("reset"):
		{
			update({status: "reset"});
			break;
		}
		default:{console.warn("unrecognzed event!: " + evt.target.id)}
	}

}

function status_lookup(message)
{
	switch(message.status)
	{
		case("uninitialized"):
		{
			console.log("background says:%c no songs available", "color: green");
			document.getElementById("play").classList.remove("hide");
			document.getElementById("pause").classList.add("hide");
			document.getElementById("song").innerHTML= message.data.current_song;
			document.getElementById("song").classList.remove("hide");
			break;
		}
		case("initialized"):
		{
			console.log("background says:%c initialized", "color: green");
			update({status: "fetch UI data"});
			break;
		}
		case("playing"):
		{
			console.log("background says:%c playing" , "color: green");
			document.getElementById("play").classList.add("hide");
			document.getElementById("pause").classList.remove("hide");
			break;
		}
		case("paused"):
		{
			console.log("background says:%c paused" , "color: green");
			document.getElementById("play").classList.remove("hide");
			document.getElementById("pause").classList.add("hide");
			break;
		}
		case("stopped"):
		{
			console.log("background says:%c stopped" , "color: green");
			document.getElementById("play").classList.remove("hide");
			document.getElementById("pause").classList.add("hide");
			break;
		}
		case("song does not exist"):
		{
			console.log("background says:%c song does not exist" , "color: green");
			document.getElementById("song").innerHTML= "song not available!";
			update({status: "next"});
			break;
		}
		case("canplaythrough"):
		{
			console.log("background says:%c canplaythrough" , "color: green");
			update({status: "fetch UI data"});
			break;
		}
		case("sending UI data"):
		{
			console.log("background says:%c sending UI data" , "color: green");
			fetch_UI(message.data);
			break;
		}
		default:{console.warn("unrecognzed state!: " + message.status);}
	}	
}

function fetch_UI(data)
{
	var song_status= data.song_status;
	//console.log(song_status);
	if(song_status == "paused" || song_status == "stopped" || song_status == "ended")
	{
		document.getElementById("play").classList.remove("hide");
		document.getElementById("pause").classList.add("hide");
	}
	else
	{
		document.getElementById("play").classList.add("hide");
		document.getElementById("pause").classList.remove("hide");
	}
	
	document.getElementById("song").innerHTML= data.current_song;
	document.getElementById("song").classList.remove("hide");

	document.getElementById("playlist").innerHTML= "";
	for(i= 0; i < data.playlist.length; i++)
	{
		var li= document.createElement("li");
		li.innerHTML= data.playlist[i];
		li.name= data.playlist[i];
		document.getElementById("playlist").appendChild(li);
		li.addEventListener("click", change_song);
	}
	if(data.rand_state == true)
		document.getElementById("randomize").classList.toggle("random");
	
	console.log("%c song database updated!" ,"color: darkorange");
	console.log("now playing: " + '%c' + data.current_song, "color: blue");
}

function process_files(evt)
{
	var playlist= [];
	var len= evt.target.files.length;
	var files= evt.target.files;
	var flag= 0;
	for(var i= 0; i < len; i++)
	{
		var reader= new FileReader();
		if(files[i])
		{
			reader.readAsDataURL(files[i]);
			reader.name= files[i].name;
			reader.addEventListener("load", function(e)
			{
				playlist.push({name: e.target.name, URL: e.target.result});
				update({status: "load", data: {playlist: {name: e.target.name, URL: e.target.result}}});
				console.log("sending song: " + '%c' + e.target.name, "color: red");	
				flag++;	
			});
		}
		else
			console.log("no file selected!");
	}

	var int_id= setInterval(function(){
		console.log("?");
		if(flag == len)
		{
			update({status: "create playlist", numb: playlist.length});
			clearInterval(int_id);
		}
	}, 1000);
	
}

function change_song(e)
{
	update({status: "song select", data:{current_song: e.target.name}});
}

function mute()
{
	update({status: "mute"});
	document.getElementById("mute").classList.toggle("hide");
	document.getElementById("unmute").classList.toggle("hide");
}

function update(message)
{
	chrome.runtime.sendMessage(message);
};

chrome.runtime.onMessage.addListener(function(message, sender, responce)
{
//	console.log(message.status);
	status_lookup(message);
});


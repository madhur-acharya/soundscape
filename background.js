console.log("%cbackground running!!!", "color: purple");

var my_audio= new Audio();
my_audio.id= "my_audio";
my_audio.setAttribute("autoplay", true);
document.body.appendChild(my_audio);
my_audio= document.getElementById("my_audio");
my_audio.addEventListener("pause", audio_event_lookup);
my_audio.addEventListener("playing", audio_event_lookup);
my_audio.addEventListener("ended", audio_event_lookup);
my_audio.addEventListener("canplaythrough", audio_event_lookup);

var songs_list= [];
var current_song= "no song selected!";
var pointer= 0;
var pre=0;
var song_status= "stopped";
var rand_state= false;

function status_lookup(message)
{
//	console.log("status: " + message.statusmessage.status);
	switch(message.status)
	{
		case("initialized?") : 
		{
			if(my_audio.src.length == 0 || my_audio.src == null || my_audio.src == undefined)
			{
				console.log("POPUP SAYS: %c initialized?" , "color: green");
				update({status: "uninitialized", data: {current_song: "click logo to select songs"}});
				song_status= "no source";
			}
			else
			{
				update({status: "initialized", data: {current_song: current_song}});
				console.log("sending songs list");
			}
			break;
		}
		case("load"): 
		{
			if(message.data.playlist.URL.length  <= 1 || song_search(message.data.playlist.name) == true)
			{
				console.log("song already exists");
				break;
			}
			else
			{
				console.log("POPUP SAYS: %c requesting to load: " + '%c' + message.data.playlist.name , "color: green", "color: red");
				songs_list.push(message.data.playlist);
				break;
			}
		}
		case("play"):
		{
			console.log("POPUP SAYS: %c requesting to play" , "color: green");
			my_audio.play();
			song_status= "playing";
			break;
		}
		case("pause"):
		{
			console.log("POPUP SAYS: %c requesting to pause" , "color: green");
			my_audio.pause();
			song_status= "paused";
			break;
		}
		case("stop"):
		{
			console.log("POPUP SAYS: %c requesting to stop" , "color: green");
			my_audio.pause();
			my_audio.currentTime = 0;
			update({status: "stopped"});
			song_status= "stopped";
			break;
		}
		case("next"):
		{
			console.log("POPUP SAYS: %c requesting to play next song..." , "color: green");
			if(songs_list.length > 0)
				next();
			break;
		}
		case("previous"):
		{
			console.log("POPUP SAYS: %c requesting to play previous song..." , "color: green");
			if(songs_list.length > 0)
				previous();
			break;
		}
		case("song select"):
		{
			console.log("POPUP SAYS: %c requesting to play: " + message.data.current_song, "color: green");
			song_select(message.data.current_song);
			break;
		}
		case("create playlist"):
		{
			console.log("POPUP SAYS: " + message.numb + " %c songs added", "color: green");
			if(song_status == "stopped" || song_status == "no source")
				song_select(songs_list[0].name);
			get_UI_data();
			break;
		}
		case("fetch UI data"):
		{
			console.log("POPUP SAYS: %c fetch UI data", "color: green");
			get_UI_data();
			break;
		}
		case("randomize"):
		{
			rand_state = !rand_state;
			console.log("randomizer state: " + rand_state);
			break;
		}
		case("mute"):
		{
			my_audio.muted= true;
			console.log("muted");
			break;
		}
		case("unmute"):
		{
			my_audio.muted= false;
			console.log("unmuted");
			break;
		}
		case("reset"):
		{
			chrome.runtime.reload();
			break;
		}
		default:{console.warn("unrecognzed state!: " + message.status);}
	}
	
}

function audio_event_lookup(evt)
{
	switch(evt.type)
	{
		case("playing"):{
			console.log("%c playing!" ,"color: darkorange");
			update({status: "playing"});
			break;
		}
		case("pause"):{
			console.log("%c paused!" ,"color: darkorange");
			update({status: "paused"});
			break;
		}
		case("ended"):{
			console.log("%c stopped!" ,"color: darkorange");
			update({status: "stopped"});
			song_status= "ended";
			next();
			break;
		}
		case("canplaythrough"):
		{
			console.log("%c canplaythrough!" ,"color: darkorange");
			update({status: "canplaythrough"});
			break;
		}
		default:{console.warn("unrecognzed event!" + evt.type)}
	}
}

function song_select(e)
{
	var flag= false;
	for(var i= 0; i < songs_list.length; i++)
	{
		if(songs_list[i].name == e)
		{
			current_song= e;
			my_audio.src= songs_list[i].URL;
			my_audio.load();
			pointer= i;
			flag= true;
			break;
		}
		else
			flag= false;
	}
	if(flag == true)
		song_status= "playing";
	else
	{
		song_status= "stopped";
		update({status: "song does not exist"});
		console.warn("selected song does not exist!")
	}
}

function get_UI_data()
{
	var sl= [];
	for(i= 0; i < songs_list.length; i++)
	{
		sl.push(songs_list[i].name);
	}
	update({status: "sending UI data", data:
	{
		song_status: song_status, 
		current_song: current_song, 
		playlist: sl, 
		rand_state: rand_state
	}});
}

function next()
{
	if(rand_state == true)
		randomize();
	else
	{
		pre= pointer;
		pointer++;
		pointer= mod(pointer , songs_list.length);
		song_select(songs_list[pointer].name);
		current_song= songs_list[pointer].name;
	}
}

function previous()
{
	pointer= pre;
	pre--;
	pointer= mod(pointer, songs_list.length);
	song_select(songs_list[pointer].name);
	current_song= songs_list[pointer].name;
}

function randomize()
{
	prev= pointer;
	pointer=  Math.floor(Math.random() * songs_list.length); 
	song_select(songs_list[pointer].name);
	current_song= songs_list[pointer].name;
}

function mod(n, m) 
{
	if(m == 0)
		return 0;
	else
    	var remain = n % m ;
    return(Math.floor(remain >= 0 ? remain : remain + m));
};

function song_search(value)
{
	var result;
	if(songs_list.length <= 0)
		return false;
	for(var b= 0; b < songs_list.length ; b++)
	{
		if(value == songs_list[b].name)
		{
			result= true;
			break;
		}
		else
			result= false; 
	}
	return result;
}

function update(message)
{
	chrome.runtime.sendMessage(message);
}

chrome.runtime.onMessage.addListener(function(message, sender, responce)
{
	status_lookup(message);
});

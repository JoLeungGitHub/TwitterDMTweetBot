console.log("Begin");

var Twit = require('twit');

/*
API login file:
module.exports = {
  consumer_key:         '...',
  consumer_secret:      '...',
  access_token:         '...',
  access_token_secret:  '...',
  timeout_ms:           60*1000, //60 Seconds before timeout
}
*/
var api_login = require('./apilogin');

var fs = require('fs');


//Input API Keys in correct keys
var T = new Twit(api_login);

//Set up a user stream
var stream = T.stream('user');

//Function to log what it tweeted
function justTweeted(err, data, response) {
	var id = data.id;
	console.log("++++++++++++++++++++++++++++++");
	console.log("DM Bot tweeted: " + data.text);
	console.log("id: " + id);
	console.log("++++++++++++++++++++++++++++++");

	//log the output in a .txt file
	var tweetlog = 
		"++++++++++++++++++++++++++++++" + "\n" +
		"DM Bot tweeted: " + data.text + "\n" +
		"id: " + id + "\n" +
		"++++++++++++++++++++++++++++++" + "\n";
	fs.appendFile('log.txt', tweetlog);
};

//Tweet that the bot has started
T.post('statuses/update', { status: 'Bot Start.' }, justTweeted);

//If someone follows the bot, follow them back
stream.on('follow', function (friendsMsg) {
	var friend = friendsMsg.source.id;
	var screenName = friendsMsg.source.screen_name;
	console.log("Bot followed: " + screenName);

	T.post('friendships/create', { user_id: friend, follow: false});
});

//If someone DMs the bot, tweet it
stream.on('direct_message', function (directMsg) {
	var fromName = directMsg.direct_message.sender.name;
	var fromScreenName = directMsg.direct_message.sender.screen_name;
	var message = directMsg.direct_message.text;
	var time = directMsg.direct_message.created_at;

	console.log("------------------------------");
	console.log("DM recieved: " + message);
	console.log("from: " + fromName + " (" + fromScreenName + ")");
	console.log("at: " + time);
	T.post('statuses/update', { status: message }, justTweeted);
	console.log("------------------------------");

	//log the input in a .txt file
	var log = 
		"------------------------------" + "\n" +
		"DM recieved: " + message + "\n" +
		"from: " + fromName + " (" + fromScreenName + ")" + "\n" +
		"at: " + time + "\n" +
		"------------------------------" + "\n";
	fs.appendFile('log.txt', log);

	/*
	//used to create a file of the data recieved, to find out what variables to use.
	var fs = require('fs');
	var json = JSON.stringify(directMsg, null, 2);
	fs.writeFile('dm.json', json);
	*/
})
//stream.on('user_event', T.post('statuses/update', {status: text}))
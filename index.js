const Discord = require('discord.js');
const client = new Discord.Client();
const DisTube = require('distube')
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: false });
const prefix = '.';
const { token } = require('./info.json');
const sendThis = '';


client.on('message', message => {
    //if(!message.content.startsWith(prefix) || message.author.bot) return; ลบเพราะว่ามันคือถ้าไม่ได้มีprefixหรือบอทเป็นคนพูด
    if (message.content === 'hello') {
        message.channel.send('bruh');
    }
    if (message.content === 'never') {
        message.channel.send('gonna');
    }
    if (message.content === 'gonna') {
        message.channel.send('give');
    }
    if (message.content === 'give') {
        message.channel.send('you up');
    }

})

client.on("ready", () => {
    console.log(`${client.user.tag} has logged in.`)
})
client.on("message", async (message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return; //ลบเพราะว่ามันคือถ้าไม่ได้มีprefixหรือบอทเป็นคนพูด

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();
    const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;


    if (command == "p" || command == "play") {
        if (!message.member.voice.channel) return message.channel.send('JOIN THE CHANNEL');
        if (!args[0]) return message.channel.send('PLAY SOMETHING')
        distube.play(message, args.join(""));
        
    }
    if (command == "stop") {
        const bot = message.guild.members.cache.get(client.user.id);
        if (!message.member.voice.channel) return message.channel.send('JOIN THE CHANNEL');
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send('YOU ARE NOT IN THE SAME')
        distube.stop(message, args.join(""));
        message.channel.send('STOPPPPPPP');
    }
    if (command == "n")
        distube.skip(message);

    if (command == "q") { //เพิ่มถ้าไม่มีเพลงให้บอกไม่มีเพลง
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"));
    }
    if (["loop","l"].includes(command)){
        let mode = distube.setRepeatMode(message, parseInt(args[0]));
        mode = mode ? mode == 2 ? "LOOP Queue" : "LOOP Song" : "LOOOOOP Off";
        message.channel.send("Set Loop mode to `" + mode + "`");
    }

    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`,'reverse'].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }
    if (command == "shuffle"){
        distube.shuffle(message);
        message.channel.send("SHUFFLED");
    }
    if (command == "autoplay") {
        let mode = distube.toggleAutoplay(message);
        message.channel.send("Set autoplay mode to `" + (mode ? "On" : "Off") + "`");
    }
    if (command == "jump") {
        distube.jump(message, parseInt(args[0]))
            .catch(err => message.channel.send("Invalid song number."));
    }
    
    // DisTube event listeners, more in the documentation page
    distube
        .on("playSong", (message, queue, song) => 
        message.channel.send(`Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user.tag}\n${status(queue)}`
        ))
        .on("addSong", (message, queue, song) =>
        message.channel.send(
            `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user.tag}`
        ))
        .on("playList", (message, queue, playlist, song) => message.channel.send(
            `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user.tag}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
        ))
        .on("addList", (message, queue, playlist) => message.channel.send(
            `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
        ))
        // DisTubeOptions.searchSongs = true
        .on("searchResult", (message, result) => {
            let i = 0;
            message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
        })
        // DisTubeOptions.searchSongs = true
        .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
        .on("error", (message, e) => {
            console.error(e)
            message.channel.send("An error encountered: " + e);
        })
        .on("initQueue", queue => {
            queue.autoplay = false;
            queue.volume = 50;
        });


});

client.login(token);
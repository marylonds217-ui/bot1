const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, enterState } = require('@discordjs/voice');
const sodium = require('libsodium-wrappers');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

client.on('ready', async () => {
    // التأكد من جاهزية مكتبة التشفير قبل الدخول
    await sodium.ready;
    
    console.log(`✅ Logged in as ${client.user.tag}`);

    // تثبيت الحالة
    client.user.setActivity('Sienna AI This Frist', {
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/discord'
    });

    const voiceChannelId = "1459504604155744287";

    const connectToChannel = async () => {
        try {
            const channel = await client.channels.fetch(voiceChannelId);
            if (channel) {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    group: client.user.id, // لمنع طرد البوتات لبعضها
                });

                // مراقبة حالة الاتصال
                connection.on(VoiceConnectionStatus.Disconnected, async () => {
                    try {
                        await Promise.race([
                            enterState(connection, VoiceConnectionStatus.Signalling, 5000),
                            enterState(connection, VoiceConnectionStatus.Connecting, 5000),
                        ]);
                    } catch (e) {
                        console.log(`⚠️ ${client.user.tag} disconnected. Reconnecting in 10s...`);
                        setTimeout(connectToChannel, 10000);
                    }
                });

                console.log(`🎙️ ${client.user.tag} successfully joined: ${channel.name}`);
            }
        } catch (error) {
            console.error(`❌ Error for ${client.user.tag}:`, error.message);
        }
    };

    connectToChannel();
});

client.login(process.env.TOKEN);
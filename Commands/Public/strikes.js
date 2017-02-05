const moment = require("moment");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
	if(suffix) {
		const member = suffix.toLowerCase()=="me" ? msg.member : bot.memberSearch(suffix, msg.guild);
		if(member) {
			const targetMemberDocument = serverDocument.members.id(member.id);
			let embed_fields = [];
			targetMemberDocument.strikes.map(strikeDocument => {
				const creator = msg.guild.members.get(strikeDocument._id);
				embed_fields.push({
					name: `Warning from @${creator ? bot.getName(msg.guild, serverDocument, creator) : "invalid-user"}`,
					value: `${strikeDocument.reason} - ${moment(strikeDocument.timestamp).fromNow()}`,
					inline: true
				})
			});
			if(targetMemberDocument.strikes.length == 0) {
				msg.channel.createMessage({
					embed: {
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                            url: "https://github.com/GilbertGobbels/GAwesomeBot"
                        },
                        color: 0x00FF00,
						description: `✅ **@${bot.getName(msg.guild, serverDocument, member)}** doesn't have any strikes`
					}
				});
			} else {
				msg.channel.createMessage({
					embed: {
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                            url: "https://github.com/GilbertGobbels/GAwesomeBot"
                        },
                        color: 0x00FF00,
						title: `Here are the strikes for ${member.username}`,
						fields: embed_fields
					}
				});
			}
		} else {
			winston.warn(`Requested member does not exist so ${commandData.name} cannot be shown`, {svrid: msg.guild.id, chid: msg.channel.id, usrid: msg.author.id});
			msg.channel.createMessage(`I don't know who ${suffix} is! 😦`);
		}
	} else {
		const info = serverDocument.members.filter(a => {
			const member = msg.guild.members.get(a._id);
			return member && bot.getUserBotAdmin(msg.guild, serverDocument, member)<1 && a.strikes.length>0;
		}).map(a => {
			return `@${bot.getName(msg.guild, serverDocument, msg.guild.members.get(a._id))}: ${a.strikes.length} strike${a.strikes.length==1 ? "" : "s"}`;
		});
		msg.channel.createMessage(info.join("\n") || "Everyone on this server is perfect 😁");
	}
};

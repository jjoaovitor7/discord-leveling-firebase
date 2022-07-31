const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, updateDoc, getDoc } = require("firebase/firestore");

class Leveling {
  constructor(client, config) {
    this.client = client;
    this.app = initializeApp(config);
    this.db = getFirestore(this.app);
  }

  #register_user(guild, member, message) {
    setDoc(guild, { name: message.guild.name });
    setDoc(member, {
      id: message.author.id,
      name: message.author.username + "#" + message.author.discriminator,
      xp: 0, level: 0, money: 0,
      daily: 0, weekly: 0, monthly: 0,
    });
  }

  #update_level(guild_doc, member, member_doc, message) {
    const calc = (member_doc.data().level + 1) * 100;
    if (member_doc.data().xp >= calc) {
      updateDoc(member, { xp: 0, level: member_doc.data().level + 1 }).then(() => {
        if (guild_doc.exists) {
          if ("channel_levelup" in guild_doc.data()) {
            const channel_id = guild_doc.data().channel_levelup;
            const channel = this.client.channels.cache.find(
              (channel) => channel.id === channel_id
            );

            channel.send(
              `<@${message.author.id}>, passou de nível! Agora ele é level ${member_doc.data().level + 1}!`
            );
          } else {
            message.reply(`você subiu de nível! Agora você é level ${member_doc.data().level + 1}.`
            );
          }
        }
      })
    } else {
      updateDoc(member, {
        xp: member_doc.data().xp + 5,
      });
    }
  }

  async leveling(message) {
    const guild = doc(this.db, "Usuarios", message.guild.id);
    const guild_doc = await getDoc(guild);

    const member = doc(guild, "Usuarios", message.author.id);
    const member_doc = await getDoc(member);

    if (member_doc.exists) {
      this.#update_level(guild_doc, member, member_doc, message);
    } else {
      this.#register_user(guild, member, message);
    }
  }
}

module.exports = Leveling;

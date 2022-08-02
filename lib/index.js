const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, deleteField, query, limit, orderBy, setDoc, updateDoc, getDoc, getDocs } = require("firebase/firestore");

class Leveling {

  /**
    * @class Leveling
    * @constructor
    * @param {Object} client - Discord "client" Object
    * @param {Object} config - Object
    */

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

  setlevelingchannel(message) {
    if (message.member.permissions.has("ADMINISTRATOR")) {
      let channel = message.mentions.channels;
      let channel_filter = channel.map(
        (_channel) =>
          new Object({
            id: _channel.id,
          }));

      if (channel_filter.length == 1) {
        const guild = doc(this.db, "Usuarios", message.guild.id)
        updateDoc(guild, {
          channel_levelup: channel_filter[0].id
        }).then(() => {
          message.channel.send(
            `Canal <#${channel_filter[0].id}> setado como canal de level-up!`
          );
        })
      } else {
        message.channel.send("Você precisa marcar o canal.");
      }
    } else {
      message.channel.send("Somente administradores podem usar esse comando.");
    }
  }

  async disablelevelingchannel(message) {
    if (message.member.permissions.has("ADMINISTRATOR")) {
      const guild = doc(this.db, "Usuarios", message.guild.id);
      const guild_doc = await getDoc(guild);
      if ("channel_levelup" in guild_doc.data()) {
        updateDoc(guild, {
          channel_levelup: deleteField(),
        }).then(() => {
          message.channel.send("Canal de level-up deletado do sistema.");
        })
      } else {
        message.channel.send(
          "Tem certeza que existe canal de level-up setado nesse servidor?"
        );
      }
    } else {
      message.channel.send("Somente administradores podem usar esse comando.");
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

  async levelingranking(message, length) {
    const guild = collection(this.db, "Usuarios", message.guild.id, "Usuarios");
    const docs_filter = query(guild, limit(length), orderBy("level", "desc"), orderBy("xp", "desc"));
    const docs = await getDocs(docs_filter);
    let arr = [];

    for (let i = 0; i < docs.size; i++) {
      arr.push(`${i + 1}: ${docs.docs[i].data().name} (level: ${docs.docs[i].data().level + 1}, xp: ${docs.docs[i].data().xp})\n`);
    }

    return arr;
  }
}

module.exports = Leveling;

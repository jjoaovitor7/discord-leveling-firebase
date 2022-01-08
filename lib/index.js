class Leveling {
    constructor(client, database) {
        this.client = client;
        this.database = database;
    }

    #createUserInDB(guildDocRef, memberDocRef, message) {
        guildDocRef.set({ name: message.guild.name });
        memberDocRef.set({
            id: message.author.id,
            name: message.author.username + "#" + message.author.discriminator,
            xp: 0, level: 0, money: 0,
            daily: 0, weekly: 0, monthly: 0,
          }).catch((error) => { console.log(error); });
    }

    #setLevel(memberSnapshot, memberRef, guildDoc, message) { 
      if (memberSnapshot.data().xp >= (memberSnapshot.data().level + 1) * 100) {
        memberRef.update({xp: 0, level: memberSnapshot.data().level + 1}).then(() => {
            guildDoc.get().then((guild) => {
              if (guild.exists) {
                guildDoc
                  .collection("Channel")
                  .get()
                  .then((guildSnapshot) => {
                    if (!guildSnapshot.empty) {
                      const query = guildSnapshot.docs[0];
                      const channel = this.client.channels.cache.find(
                        (channel) => channel.id === query.id
                      );

                      memberRef.get().then((memberSnapshot) => {
                        channel.send(
                          `<@${
                            message.author.id
                          }>, passou de nível! Agora ele é level ${
                            memberSnapshot.data().level + 1
                          }!`
                        );
                      });
                    }
                  });
              } else {
                memberRef.get().then((levelUpSnapshot) => {
                  message.reply(
                    `você subiu de nível! Agora você é level ${
                      levelUpSnapshot.data().level + 1
                    }.`
                  );
                });
              }
            });
          }).catch((error) => { console.log(error); });
      } else {
        memberRef
          .update({
            xp: memberSnapshot.data().xp + 5,
            level: memberSnapshot.data().level,
          }).catch((error) => {
            console.log(error);
          });
      }
    }

    leveling(message) { 
      const guildRef = this.database.collection("Usuarios").doc(message.guild.id);
      const memberRef = guildRef.collection("Usuarios").doc(message.author.id);
  
      memberRef.get().then((member) => {
        if (member.exists) {
          this.#setLevel(member, memberRef, guildRef, message);
        } else {
          this.#createUserInDB(guildRef, memberRef, message);
        }
      });
    }
}

module.exports = Leveling;
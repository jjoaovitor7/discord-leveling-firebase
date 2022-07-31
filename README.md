# discord-leveling-firebase

Sistema de leveling exponencial para bots do Discord.

### Instalação

```js
npm i discord-leveling-firebase
```

### Exemplo de uso

```js
const Leveling = require("discord-leveling-firebase");
const leveling = new Leveling(client, {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
});

client.on("message", async (message) => {
  leveling.leveling(message);
});
```

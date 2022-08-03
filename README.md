# discord-leveling-firebase

[![discord-leveling-firebase](https://nodei.co/npm/discord-leveling-firebase.png)](https://nodei.co/npm/discord-leveling-firebase/)

Sistema de leveling exponencial para bots do Discord.

## Instalação (npm)

```js
npm i discord-leveling-firebase
```

## Exemplo de uso

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

## Métodos
> leveling
```
leveling.leveling(message);
```

> setlevelingchannel
```
leveling.setlevelingchannel(message);
```

> disablelevelingchannel
```
leveling.disablelevelingchannel(message);
```

> levelingranking
```
leveling.levelingranking(message, length);
```

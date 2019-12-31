<template>
  <div id="app">

    <div
      class="centerForm flex w75pr"
      v-if="infoText == ''"
    >
      <input
        class="wFull margin5V"
        type="text"
        placeholder="Mot"
        v-model="word"
      >
      <input
        class="wFull"
        type="text"
        placeholder="Exception"
        v-model="exceptionWord"
      >

      <a class="wFull margin15V" @click="sendWord">Envoyer</a>
    </div>

    <h1 class="absoluteCenter wFull" v-if="infoText != ''">
      {{ infoText }}
    </h1>

    <div
      class="foot"
    >{{ players }} joueurs</div>
  </div>
</template>

<script>
export default {
  methods: {

    sendWord() {
      if (this.word.length <= 1) return;

      this.socket.emit('word', this.word, this.exceptionWord, () => {
        this.infoText = 'Ok !';
      });
    },

  },

  mounted() {
    this.socket.emit('play');

    this.socket.on('players', (players) => {
      this.players = players;
      if (this.players < 3) {
        this.infoText = `En attente de ${3 - this.players} joueur${(3 - this.players > 1 ? 's' : '')}`;
      } else {
        this.infoText = '';
      }
    });

    this.socket.on('word', (word) => {
      this.infoText = '3...';
      setTimeout(() => {
        this.infoText = '2...';
        setTimeout(() => {
          this.infoText = '1...';
          setTimeout(() => {
            this.infoText = word;
          }, 1000);
        }, 1000);
      }, 1000);
    });
  },

  data() {
    return {
      players: 0,

      word: '',
      exceptionWord: '',

      infoText: '',
    };
  },

};
</script>

<style>
:root {
  --color1: #3cb656;
  --background: #2c3e50;
  --background-2: #374e64;
  --text: #f0f0f0;
}

body {
  background-color: var(--background);
  margin: 0;
}

body * {
  box-sizing: border-box;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--text);
}

input[type=text] {
  padding: 10px 10px 8px;
  outline: none;
}

a {
  background: var(--color1);
  padding: 10px 20px;
  cursor: pointer;
}

a:hover {
  opacity: 0.8;
}

.absoluteCenter {
  position: absolute;
  padding: 0 20px;
  top: calc(50% - 60px);
  left: 0;
  margin: 0;
}

.centerForm {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100vh;
  margin: 0 auto;
}

.flex {
  display: flex;
}

.foot {
  position: absolute;
  bottom: 0;
  background-color: var(--color1);
  line-height: 60px;
  width: 100vw;
  font-size: 21px;
  cursor: default;
}

.foot:hover { opacity: 0.8 }

.margin5V { margin: 5px 0 }
.margin15V { margin: 15px 0 }
.margin20V { margin: 20px 0 }

.margin5H { margin: 0 5px }
.margin15H { margin: 0 15px }
.margin20H { margin: 0 20px }

.margin10 { margin: 10px }
.margin20 { margin: 20px }
.margin30 { margin: 30px }

.w100 { width: 100px }
.w200 { width: 200px }
.w300 { width: 300px }
.w400 { width: 400px }

.w25pr { width: 25%  }
.wHalf { width: 50%  }
.w75pr { width: 75%  }
.wFull { width: 100% }

</style>

<template>
  <div class="room__container">
    <div class="playlist__container" data-test="playlist-container">
      <strong class="container__title">File d'attente</strong>
      <ul class="song-list">
        <li v-for="song in party.playlist" :key="song" class="song-item">
          <span class="song-picture"></span>
          <span class="song-title">{{ song }}</span>
        </li>
      </ul>
    </div>
    <div class="players__container" data-test="players-container">
      <div class="player">
        <youtube
          id="player1"
          :videoId="firstVideoId"
          @ready="onReady"
          @playing="onPlay1"
          @paused="onPause1"
          @ended="onEnded1"
          ref="player1"
        ></youtube>
      </div>
      <div class="player">
        <youtube
          id="player2"
          :videoId="secondVideoId"
          @playing="onPlay2"
          @paused="onPause2"
          @ended="onEnded2"
          ref="player2"
        ></youtube>
      </div>
    </div>
    <div class="users__container" data-test="users-container">
      <div class="users__list__container">
        <div class="container__title">
          <strong>Utilisateurs</strong>
        </div>
        <ul>
          <li v-for="user in users" :key="user">
            <span class="users__list__img"></span>
            <span>{{ user }}</span>
          </li>
        </ul>
      </div>
      <div class="qr-code__container" data-test="qr-code-container">
        <span>{{ party.id }}</span>
        <div class="qr-code__content">
          <qrcode-vue :value="generateQrCodeValue(party.id)" :size="qrCodeSize" level="H"></qrcode-vue>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from '@vue/composition-api'
import QrcodeVue from 'qrcode.vue'
import usePlayerFeature from '@front/feature/player.feature'
import useQrCodeFeature from '@front/feature/qr-code.feature'
import useHost from './host.feature'

const Host = defineComponent({
  name: 'Host',
  components: {
    QrcodeVue
  },
  setup(props, context) {
    const { party, users, fetchParty } = useHost(context.root.$route.params.partyId)
    const { qrCodeSize, generateQrCodeValue } = useQrCodeFeature()

    const {
      player: player1,
      videoId: firstVideoId,
      linkPlayer: linkPlayer1,
      nextVideoId: firstNextVideoId,
      onPlay: onPlay1,
      onPause: onPause1,
      onEnded: onEnded1
    } = usePlayerFeature(party)
    const {
      player: player2,
      videoId: secondVideoId,
      linkPlayer: linkPlayer2,
      nextVideoId: secondNextVideoId,
      onPlay: onPlay2,
      onPause: onPause2,
      onEnded: onEnded2
    } = usePlayerFeature(party)

    const stopEffect = watch(
      () => party.playlist.length,
      async () => {
        const { playlist } = party
        if (playlist.length > 0) {
          const [first, second] = playlist
          firstVideoId.value = first
          secondVideoId.value = second
          await context.root.$nextTick()
          player1.value.player.playVideo()
          linkPlayer1(player2.value)
          linkPlayer2(player1.value)
          stopEffect()
        }
      }
    )

    function playerState(player) {
      return player?.value?.player?.getPlayerState?.()
    }

    async function onReady() {
      await fetchParty()
    }

    watch(
      () => party.playlist.length,
      () => {
        const { playlist } = party
        const [, second] = playlist
        const playerState1 = playerState(player1)
        const playerState2 = playerState(player2)
        if (second !== firstNextVideoId.value && playerState1 === 1) {
          if (!firstVideoId.value) {
            firstVideoId.value = second
          } else if (!secondVideoId.value) {
            secondVideoId.value = second
          } else {
            firstNextVideoId.value = second
          }
        } else if (second !== secondNextVideoId.value && playerState2 === 1) {
          if (!secondVideoId.value) {
            secondVideoId.value = second
          } else if (!firstVideoId.value) {
            firstVideoId.value = second
          } else {
            secondNextVideoId.value = second
          }
        }
      }
    )

    return {
      party,
      users,
      player1,
      player2,
      firstVideoId,
      secondVideoId,
      onPlay1,
      onPlay2,
      onPause1,
      onPause2,
      onEnded1,
      onEnded2,
      qrCodeSize,
      onReady,
      generateQrCodeValue
    }
  }
})
export default Host
</script>

<style lang="scss" scoped>
.room__container {
  display: flex;
  height: 100%;
}
.container__title {
  width: 100%;
  text-align: center;
}
.players__container {
  width: 60%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  background-color: #eef8ff;
  border-radius: 1rem;
  margin: 0 4rem;

  .player {
    width: 100%;
    height: 50%;
    margin: 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.playlist__container {
  height: 100%;
  width: 20%;
  background-color: #eef8ff;
  border-radius: 1rem;
  padding: 1rem;
  .song-list {
    list-style: none;
    padding: 0;
    .song-item {
      display: flex;
      height: 4rem;
      margin: 1rem 0;
      border-radius: 1rem;
      border: 1px solid lightgray;
      .song-picture {
        width: 25%;
        border-radius: 1rem;
        background-image: url('https://picsum.photos/64/64');
      }
      .song-title {
        padding: 0.5rem;
      }
    }
  }
}
.users__container {
  height: 100%;
  width: 20%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  background-color: #eef8ff;
  border-radius: 1rem;
  .users__list__container {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    ul > li {
      display: flex;
      align-items: center;
    }
    .users__list__img {
      width: 2rem;
      height: 2rem;
      background-image: url('../../assets/user.jpg');
      background-size: contain;
      display: block;
      margin-right: 8px !important;
      border-radius: 50%;
      border: 2px solid white;
    }
  }
  .qr-code__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 16px;
  }
  .qr-code__content {
    border: 4px solid white;

    & > div {
      height: 150px;
    }
  }
}
.border-right-8 {
  border-right: 8px !important;
}
</style>

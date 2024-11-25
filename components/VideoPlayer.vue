<template>
  <div class="video-container" ref="videoContainer" style="
    display: flex;
    flex-direction: column;
    align-items: center; /* 横方向に中央揃え */
    justify-content: center; /* 縦方向に中央揃え */
    height: 100vh; /* コンテナの高さを画面全体に設定 */"
    >
    <!-- Video.js のスタイルを読み込み -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" />
    <link href="https://vjs.zencdn.net/5.16.0/video-js.min.css" rel="stylesheet" />
    <!-- ref を設定 -->
    <div>
    <video ref="videoPlayer" class="video-js vjs-default-skin" controls width="640px" height="360px"></video>
    </div>
    <div>
      <button id="add-button">再生登録</button>
      <button id="play-button" disabled>再生</button>
      <button id="stop-button" disabled>停止</button>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js'; // npm install video.js@^8.11.6
import 'videojs-playlist'; // npm install videojs-playlist
import 'videojs-contrib-ads'; // npm install videojs-contrib-ads
import 'videojs-ima'; // npm install videojs-ima

// プレイリストをモジュールスコープで定義
export const playlist = [
  {
    sources: [
      {
        src: 'https://localhost:3000/vmap/content3.mpd',
        type: 'application/dash+xml',
        title: 'Video 4',
      },
    ],
  },
  {
    sources: [
      {
        src: 'https://localhost:3000/vmap/content0.m3u8',
        type: 'application/x-mpegURL',
        title: 'Video 1',
      },
    ],
  },
  {
    sources: [
      {
        src: 'https://localhost:3000/vmap/content1.m3u8',
        type: 'application/x-mpegURL',
        title: 'Video 2',
      },
    ],
  },
  {
    sources: [
      {
        src: 'https://localhost:3000/vmap/content2.m3u8',
        type: 'application/x-mpegURL',
        title: 'Video 3',
      },
    ],
  },
];

export const startIndex = 0;

export default {
  name: 'VideoPlayer',
  data() {
    return {
      adSourceId: null,
    };
  },
  mounted() {
    // プラグインが利用可能か確認
    if (!videojs.getPlugin('ima')) {
      console.error('IMAプラグインが登録されていません');
    }
    this.initializePlayer();
    this.initializeAds();
    const videoPlayer = this.$refs.videoPlayer;
  },
  methods: {
    // 動画の初期化とロード
    initializePlayer() {
      const videoPlayer = this.$refs.videoPlayer;
      // プレイヤーを再初期化
      this.player = videojs(videoPlayer, {
        controls: false,   // コントロールを表示
        autoplay: false,   // 自動再生
        muted: false,      // ミュート状態
        preload: 'auto'   // メディアの事前読み込み
      });
      const addButton = document.getElementById('add-button');
      const playButton = document.getElementById('play-button');
      const stopButton = document.getElementById('stop-button');
      // 再生登録にイベントを設定
      addButton.addEventListener('click', () => {
        addButton.disabled = true;
        this.player.pause();
        setTimeout(() => {
          playButton.disabled = true;
          stopButton.disabled = false;
          this.player.play().catch((error) => {
            console.error('再生エラー:', error);
          });
        }, 5000);
      });
      // 再生にイベントを設定
      playButton.addEventListener('click', () => {
        const playButton = document.getElementById('play-button');
        const stopButton = document.getElementById('stop-button');
        playButton.disabled = true;
        stopButton.disabled = false;
        this.player.play();
      });
      // 停止にイベントを設定
      stopButton.addEventListener('click', () => {
        const playButton = document.getElementById('play-button');
        const stopButton = document.getElementById('stop-button');
        playButton.disabled = false;
        stopButton.disabled = true;
        this.player.pause();
      });

      this.player.playlist(playlist);
      this.player.playlist.autoadvance(null);
      this.player.playlist.currentItem(startIndex);
      this.setupEventListeners();
    },
    // 広告の初期化とロード
    initializeAds(currentIndex) {
      // IMA プラグインの再初期化
      this.player.ima({
        adTagUrl: this.getAdTagUrlForItem(4), // 新しい広告URL
        debug: true,
//        enablePostroll: true, // ポストロールを有効化
      });

      this.adsManagerLoadedCallback();
    },

    setupEventListeners() {
      this.player.on('play', () => {
          const currentIndex = this.player.playlist.currentItem();
          console.log(`Play triggered. Requesting ads for index ${currentIndex}`);
      });

      this.player.on('contentchanged', () => {
        console.log('Content changed, resetting ads plugin');
      });

      this.player.on('readyforpreroll', () => console.log('Ready for preroll'));

      // 広告に関する他のイベント
      this.player.on('adsready', () => {
        console.log('Ads are ready after reset');
      });
      this.player.on('adtimeout', () => {
        console.warn('広告のタイムアウトが発生しました。');
        console.warn('Ad timeout occurred:', this.player.ads.state); // 現在の状態を出力
      });

      // 広告が開始された時
      this.player.on('adstart', (event) => {
        console.log('広告が開始されました。：', event);
        // 現在の広告情報を取得
        const adsManager = this.player.ima.getAdsManager();
        const currentAd = adsManager.getCurrentAd();
        if (currentAd) {
          // VMAPで指定されているAdSourceのidを取得
          this.adSourceId = currentAd.getAdId(); // Ad ID
        } else {
          console.warn('現在の広告が取得できませんでした。');
        }
        const playButton = document.getElementById('play-button');
        const stopButton = document.getElementById('stop-button');
        playButton.disabled = true;
        stopButton.disabled = true;
      });
      // 広告が終了した時
      this.player.on('adend', (event) => {
        console.log('広告が終了しました。動画の再生を続けます。：', event);
        console.log(`広告ID: ${this.adSourceId}`);
        const playButton = document.getElementById('play-button');
        const stopButton = document.getElementById('stop-button');
        playButton.disabled = true;
        stopButton.disabled = false;
      });
      this.player.on('contentresume', () => {
        console.log('広告終了後、コンテンツ再生を再開します');
      });

      // 広告が終了した時
      this.player.on('adsallpodscompleted', () => {
        console.log('すべての広告が終了しました。');
      });
      this.player.on('ads-pod-ended', () => {
        console.log('Post-roll (広告ポッド) が終了しました');
      });
      this.player.on('adsallpodscompleted', () => {
        console.log('すべての広告ポッドが終了しました (Post-rollも含む)');
      });
      this.player.on('adsdone', () => {
        console.log('すべての広告が完了しました (AdsDone)');
      });

      this.player.on('contentended', () => {
        console.log('コンテンツの再生が終了しました');
        const currentIndex = this.player.playlist.currentItem();
        const nextIndex = currentIndex === playlist.length - 1 ? 0 : currentIndex + 1;
        console.log(`現在の動画インデックス: ${currentIndex}, 次のインデックス: ${nextIndex}`);
        // 次のコンテンツ設定
        this.player.playlist.currentItem(nextIndex);
        // 新しい広告URLを再設定
        this.player.ima.initializeAdDisplayContainer();
        this.player.ima.setContentWithAdTag(null, this.getAdTagUrlForItem(nextIndex), false);
        this.player.ima.requestAds();

      });

      // 現在の動画のインデックスを表示
      this.player.on('playlistitem', () => {
        const currentIndex = this.player.playlist.currentItem();
        console.log(`現在の動画インデックス: ${currentIndex}`);
        console.log(`再生中の動画: ${playlist[currentIndex].sources[0].title}`);
      });

      // 再生終了時の処理
      this.player.on('ended', () => {
          console.log('動画が終了しました（ended イベント）');
      });

      // エラーの処理
      this.player.on('error', () => {
        console.error('Video.js Error:', this.player.error());
      });
      this.player.on('adsloadererror', (event) => {
        console.error('Ads Loader Error:', event);
      });

      this.player.on('adserror', (event) => {
        console.error('Ad Error:', event);
      });
    },

    adsManagerLoadedCallback() {
      const events = [
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        google.ima.AdEvent.Type.CLICK,
        google.ima.AdEvent.Type.COMPLETE,
        google.ima.AdEvent.Type.FIRST_QUARTILE,
        google.ima.AdEvent.Type.LOADED,
        google.ima.AdEvent.Type.MIDPOINT,
        google.ima.AdEvent.Type.PAUSED,
        google.ima.AdEvent.Type.RESUMED,
        google.ima.AdEvent.Type.STARTED,
        google.ima.AdEvent.Type.THIRD_QUARTILE,
      ];

      events.forEach((eventType) => {
        this.player.ima.addEventListener(eventType, this.onAdEvent);
      });

      this.player.on('adslog', this.onAdLog);
    },
    onAdLog(data) {
      console.log('Ad log:', data?.data?.AdError);
    },
    onAdEvent(event) {
      const message = `Ad event: ${event.type}`;
      console.log(message);
    },
      
    getAdTagUrlForItem(index) {
      // 動画ごとの広告タグを定義
      const adTags = [
        'https://localhost:3000/vmap/vmap1-mp4.xml',
        'https://localhost:3000/vmap/vmap1-mp4.xml',
        'https://localhost:3000/vmap/vmap2-mp4.xml',
        'https://localhost:3000/vmap/vmap3-mp4.xml',
        'https://localhost:3000/vmap/vmap-mp4.xml',
      ];

      // インデックスに対応する広告タグを返す
      const adTagUrl = adTags[index];
      console.log(`Generated Ad Tag URL for index ${index}: ${adTagUrl}`);
      return adTagUrl;
    },
  }
};
</script>

<style scoped>
.video-container {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

video {
  display: inline-block;
  border: 2px solid #ddd;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  border-radius: 5px;
}

/* 非活性状態のボタン */
button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}
</style>

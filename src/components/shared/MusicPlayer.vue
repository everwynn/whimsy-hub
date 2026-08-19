<template>
  <div class="music-controls">
    <button 
      class="music-btn" 
      @click="toggleMusic" 
      :class="{ 'muted': !musicEnabled, 'playing': musicEnabled }" 
      :title="musicEnabled ? '静音' : '开启音乐'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path v-if="musicEnabled" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  musicSrc: {
    type: String,
    required: true
  },
  autoPlay: {
    type: Boolean,
    default: false  // 默认不自动播放，避免浏览器策略限制
  }
});

const musicEnabled = ref(false); // 默认为关闭状态，避免自动播放被阻止
let bgAudio = null;
let isAudioReady = false;

// 初始化音频
function initAudio() {
  if (!bgAudio) {
    bgAudio = new Audio(props.musicSrc);
    bgAudio.loop = true;
    bgAudio.volume = 1.0; // 最大音量，由系统音量控制最终大小
    
    // 添加更多音频事件处理
    bgAudio.oncanplay = () => {
      console.log('音频已准备就绪');
      isAudioReady = true;
    };
    
    bgAudio.oncanplaythrough = () => {
      console.log('音频可以流畅播放');
    };
    
    bgAudio.onplay = () => {
      console.log('音频开始播放');
      musicEnabled.value = true;
    };
    
    bgAudio.onpause = () => {
      console.log('音频暂停');
      musicEnabled.value = false;
    };
    
    bgAudio.onerror = (e) => {
      console.error('音频加载错误:', e);
    };
    
    bgAudio.onloadedmetadata = () => {
      console.log('音频元数据加载完成');
    };
  }
}

// 切换音乐开关
function toggleMusic() {
  initAudio();
  
  if (musicEnabled.value) {
    // 当前音乐开启，需要关闭
    bgAudio.pause();
    musicEnabled.value = false;
  } else {
    // 当前音乐关闭，需要开启
    bgAudio.play()
      .then(() => {
        console.log('音频播放成功');
        musicEnabled.value = true;
      })
      .catch(e => {
        console.error('音频播放被阻止:', e);
        // 如果被阻止，尝试先加载再播放
        if (e.name === 'AbortError' || e.name === 'NotAllowedError') {
          // 首先尝试加载音频
          bgAudio.load();
          
          // 使用 setTimeout 确保在下一个事件循环中尝试播放
          setTimeout(() => {
            bgAudio.play()
              .then(() => {
                console.log('延迟音频播放成功');
                musicEnabled.value = true;
              })
              .catch(err => {
                console.error('延迟音频播放也被阻止:', err);
                console.log('可能需要用户更多交互才能播放音乐');
              });
          }, 100);
        }
        musicEnabled.value = false;
      });
  }
}

// 页面可见性变化时控制音乐
function handleVisibilityChange() {
  if (!bgAudio) return;
  
  if (document.hidden) {
    bgAudio.pause();
  } else if (musicEnabled.value) {
    bgAudio.play().catch(e => {
      console.error('页面可见性变化时音频播放被阻止:', e);
      // 尝试延迟播放
      setTimeout(() => {
        bgAudio.play().catch(err => {
          console.log('页面可见性变化时延迟播放也被阻止:', err);
        });
      }, 100);
    });
  }
}

onMounted(() => {
  // 添加页面可见性监听器
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 初始化音频
  initAudio();
  
  // 自动播放：尝试播放音乐，如果被浏览器策略阻止，则在首次用户交互时重试
  if (props.autoPlay) {
    const tryPlay = () => {
      bgAudio.play()
        .then(() => {
          console.log('自动播放成功');
          musicEnabled.value = true;
        })
        .catch(e => {
          console.log('自动播放被阻止，等待用户交互:', e.message);
          // 在首次用户交互时重试一次
          const retryOnInteraction = () => {
            bgAudio.play()
              .then(() => {
                console.log('交互后自动播放成功');
                musicEnabled.value = true;
              })
              .catch(err => console.log('交互后播放仍失败:', err.message));
            document.removeEventListener('click', retryOnInteraction);
            document.removeEventListener('touchstart', retryOnInteraction);
            document.removeEventListener('keydown', retryOnInteraction);
          };
          document.addEventListener('click', retryOnInteraction, { once: true });
          document.addEventListener('touchstart', retryOnInteraction, { once: true });
          document.addEventListener('keydown', retryOnInteraction, { once: true });
        });
    };
    // 等待音频就绪后尝试播放
    if (isAudioReady) {
      tryPlay();
    } else {
      bgAudio.addEventListener('canplay', () => tryPlay(), { once: true });
    }
  }
});

// 兜底：监听 autoPlay 变化，如果父组件延迟设置分享模式也能触发播放
watch(() => props.autoPlay, (newVal) => {
  if (newVal && bgAudio && !musicEnabled.value) {
    const tryPlay = () => {
      bgAudio.play()
        .then(() => {
          console.log('延迟自动播放成功');
          musicEnabled.value = true;
        })
        .catch(e => {
          console.log('延迟自动播放被阻止:', e.message);
          const retryOnInteraction = () => {
            bgAudio.play()
              .then(() => {
                console.log('延迟交互后自动播放成功');
                musicEnabled.value = true;
              })
              .catch(err => console.log('延迟交互后播放仍失败:', err.message));
            document.removeEventListener('click', retryOnInteraction);
            document.removeEventListener('touchstart', retryOnInteraction);
            document.removeEventListener('keydown', retryOnInteraction);
          };
          document.addEventListener('click', retryOnInteraction, { once: true });
          document.addEventListener('touchstart', retryOnInteraction, { once: true });
          document.addEventListener('keydown', retryOnInteraction, { once: true });
        });
    };
    if (isAudioReady) {
      tryPlay();
    } else {
      bgAudio.addEventListener('canplay', () => tryPlay(), { once: true });
    }
  }
});

onUnmounted(() => {
  // 清理音频
  if (bgAudio) {
    bgAudio.pause();
    bgAudio = null;
  }
  
  // 移除页面可见性监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.music-controls {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}

.music-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.music-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.music-btn.muted {
  opacity: 0.6;
}

/* 播放状态下添加旋转动画 */
.music-btn.playing {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
<template>
  <div class="blessing-page">
    <!-- 返回首页 -->
    <a v-if="!isShareMode" :href="homeUrl" class="back-btn">← 返回</a>

    <!-- 祝福信息（来自分享链接时显示） -->
    <div v-if="blessingFrom" class="blessing-header">
      <p class="blessing-from">来自 {{ blessingFrom }} 的祝福</p>
      <h1 class="blessing-to">Dear {{ blessingTo }}</h1>
      <p v-if="blessingMsg" class="blessing-msg">{{ blessingMsg }}</p>
    </div>

    <!-- 标题（水合后显示，鹊桥全屏步骤隐藏，避免 SSR 闪烁） -->
    <div v-if="hydrated && !isShareMode && !blessingFrom && currentStep !== 0" class="page-header">
      <h1 class="festival-title">{{ festival?.icon }} {{ festival?.name }}</h1>
      <p class="festival-subtitle">{{ festival?.alias }}</p>
    </div>

    <!-- 步骤导航（水合后显示，鹊桥全屏步骤隐藏，避免 SSR 闪烁） -->
    <div v-if="hydrated && !isShareMode && currentStep !== 0" class="step-nav">
      <button
        v-for="(step, idx) in steps"
        :key="idx"
        :class="['step-btn', { active: currentStep === idx, done: stepDone[idx] }]"
        @click="goToStep(idx)"
      >
        <span class="step-num">{{ idx + 1 }}</span>
        <span class="step-label">{{ step }}</span>
      </button>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- Step 1: 鹊桥相会（全屏沉浸） -->
      <div v-show="currentStep === 0" class="step-panel bloom-step">
        <div class="rose-wrapper">
          <RoseBloom
            ref="roseRef"
            :auto-play="true"
            :show-controls="true"
            @scene-complete="onBloomComplete"
          />
        </div>
        <div class="bloom-overlay">
<!--          <p class="step-hint">{{ stepHintText }}</p>-->
<!--          <div class="bloom-actions">-->
<!--            <button v-if="!isShareMode && stepDone[0]" @click="goToStep(1)" class="next-btn">-->
<!--              欣赏完毕，去摇签 →-->
<!--            </button>-->
<!--            <button v-if="!isShareMode" @click="shareBloom" class="share-icon-btn" title="分享此页面">-->
<!--              <span>分享</span>-->
<!--            </button>-->
<!--          </div>-->
        </div>
      </div>

      <!-- Step 2: 摇签抽签 -->
      <div v-show="currentStep === 1" class="step-panel fortune-step">
        <FortuneDrawing
          :initial-fortune-id="fortuneId"
          :is-share-mode="isShareMode"
          @fortune-drawn="onFortuneDrawn"
          @share-fortune="onShareFortune"
          @share-step="shareFortuneStep"
        />
        <button v-if="!isShareMode && stepDone[1]" @click="goToStep(2)" class="next-btn fortune-next-btn">
          去分享祝福 →
        </button>
      </div>

      <!-- Step 3: 分享 -->
      <div v-show="currentStep === 2" class="step-panel share-step">
        <SharePanel
          :festival-id="festivalId"
          :fortune-id="fortuneId"
          :is-share-mode="isShareMode"
        />
        <button v-if="!isShareMode && stepDone[1]" @click="goToStep(3); stepDone[2] = true" class="next-btn share-next-btn">
          去看玫瑰绽放 →
        </button>
      </div>

      <!-- Step 4: 玫瑰绽放 -->
      <div v-show="currentStep === 3" class="step-panel rose-step">
        <RoseSide :is-share-mode="isShareMode" @share-step="shareRoseStep" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import RoseBloom from '../bloom/RoseBloom.vue';
import FortuneDrawing from '../fortune/FortuneDrawing.vue';
import SharePanel from '../share/SharePanel.vue';
import RoseSide from '../rose/RoseSide.vue';
import festivalsData from '../../data/festivals.json';
import { decodeSharePayload, buildShareUrl, type SharePayload } from '../../utils/shareCodec';

interface Props {
  festivalId: string;
}

const props = defineProps<Props>();

const festivals = festivalsData as any[];
const festival = computed(() => festivals.find(f => f.id === props.festivalId));

const homeUrl = computed(() => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return base;
});

const steps = ['鹊桥', '摇签', '分享', '玫瑰'];
const currentStep = ref(0);
const stepDone = ref([false, false, false, false]);
const roseRef = ref();
const fortuneId = ref<number>();

// 分享链接参数
const blessingFrom = ref('');
const blessingTo = ref('');
const blessingMsg = ref('');
const isShareMode = ref(false);

// SSR 水合标记：避免 SSR 渲染的标题和步骤栏在客户端水合前闪烁
const hydrated = ref(false);

const stepHintText = computed(() => {
  if (stepDone.value[0]) return '鹊桥已成 · 牛郎织女终相会 · 点击画面有惊喜 · 可开启背景音乐';
  return '喜鹊正在从四方飞来搭建鹊桥，牛郎织女即将相会...';
});

function goToStep(idx: number) {
  currentStep.value = idx;
}

function onBloomComplete() {
  stepDone.value[0] = true;
}

function onFortuneDrawn(fortune: any) {
  fortuneId.value = fortune.id;
  stepDone.value[1] = true;
}

function onShareFortune(fortune: any) {
  fortuneId.value = fortune.id;
  goToStep(2);
}

function shareBloom() {
  const url = buildShareUrl({ festivalId: props.festivalId, step: 0 });
  copyToClipboard(url, '鹊桥页面链接已复制');
}

function shareFortuneStep() {
  const url = buildShareUrl({ festivalId: props.festivalId, step: 1, fortuneId: fortuneId.value });
  copyToClipboard(url, '摇签页面链接已复制');
}

function shareRoseStep() {
  const url = buildShareUrl({ festivalId: props.festivalId, step: 3 });
  copyToClipboard(url, '玫瑰绽放页面链接已复制');
}

function copyToClipboard(url: string, successMsg: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert(successMsg));
  } else {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert(successMsg);
  }
}

onMounted(() => {
  // 先解析 URL 参数，确保 currentStep 在水合前就是正确的值，避免标题/导航栏闪烁
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s');
  isShareMode.value = !!encoded;
  if (encoded) {
    const payload = decodeSharePayload(encoded);
    if (payload && payload.festivalId === props.festivalId) {
      if (payload.step === 2 && payload.from && payload.to) {
        blessingFrom.value = payload.from;
        blessingTo.value = payload.to;
        blessingMsg.value = payload.msg || '';
        currentStep.value = 0;
      } else if (payload.step === 2) {
        currentStep.value = 2;
        stepDone.value[0] = true;
        stepDone.value[1] = true;
      } else if (payload.step === 1 && payload.fortuneId) {
        fortuneId.value = payload.fortuneId;
        currentStep.value = 1;
        stepDone.value[0] = true;
      } else if (payload.step === 3) {
        currentStep.value = 3;
        stepDone.value[0] = true;
        stepDone.value[1] = true;
        stepDone.value[2] = true;
      } else if (payload.step === 0) {
        currentStep.value = 0;
      }
    }
  } else {
    // 非分享模式：支持通过 step 参数直接跳转到指定步骤
    const stepParam = params.get('step');
    if (stepParam !== null) {
      const step = parseInt(stepParam, 10);
      if (step >= 0 && step <= 3) {
        currentStep.value = step;
        // 标记前面的步骤为已完成
        for (let i = 0; i < step; i++) {
          stepDone.value[i] = true;
        }
      }
    }
  }

  // 参数解析完成后再标记水合，确保标题/导航栏不会因 currentStep 变化而闪烁
  hydrated.value = true;
});
</script>

<style scoped>
.blessing-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 20%, #1a1040 0%, #0e0828 40%, #080418 80%, #03020a 100%);
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  padding: 6px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  text-decoration: none;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.blessing-header {
  text-align: center;
  padding-top: 40px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.blessing-from {
  font-size: 14px;
  color: rgba(251, 191, 136, 0.6);
  margin-bottom: 8px;
  letter-spacing: 2px;
  font-family: 'Noto Serif SC', serif;
}

.blessing-to {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(to right, #fda4af, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  font-family: 'Noto Serif SC', serif;
}

.blessing-msg {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  line-height: 1.8;
  font-family: 'Noto Serif SC', serif;
}

.page-header {
  text-align: center;
  padding-top: 40px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.festival-title {
  font-size: 2rem;
  font-family: 'Noto Serif SC', serif;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(244, 63, 94, 0.3);
}

.festival-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Noto Serif SC', serif;
}

.step-nav {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
  z-index: 10;
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.step-btn.active {
  border-color: rgba(244, 63, 94, 0.5);
  background: rgba(244, 63, 94, 0.15);
  color: rgba(244, 63, 94, 0.9);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.1);
}

.step-btn.done {
  border-color: rgba(34, 197, 94, 0.3);
  color: rgba(34, 197, 94, 0.7);
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.05);
}

.step-btn.active .step-num {
  background: rgba(244, 63, 94, 0.2);
}

.step-btn.done .step-num {
  background: rgba(34, 197, 94, 0.15);
}

.step-content {
  position: relative;
  z-index: 10;
}

.step-panel {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 玫瑰花全屏沉浸布局 */
.bloom-step {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5;
}

.rose-wrapper {
  width: 100%;
  height: 100%;
}

.bloom-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-bottom: 80px;
  z-index: 20;
  pointer-events: none;
}

.bloom-overlay > * {
  pointer-events: auto;
}

.step-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Noto Serif SC', serif;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.next-btn {
  padding: 10px 32px;
  border-radius: 9999px;
  border: 1px solid rgba(244, 63, 94, 0.3);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(225, 29, 72, 0.1));
  backdrop-filter: blur(8px);
  color: rgba(244, 63, 94, 0.9);
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
}

.next-btn:hover {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2));
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
}

/* 抽签步骤布局：避免纵向滚动条 */
.fortune-step {
  position: relative;
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.fortune-next-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

/* 分享按钮 */
.bloom-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-icon-btn {
  padding: 10px 20px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
}

.share-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.share-step {
  position: relative;
  min-height: calc(100vh - 180px);
}

.share-next-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

.rose-step {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5;
}

@media (max-width: 640px) {
  .step-nav {
    gap: 8px;
  }

  .step-btn {
    padding: 6px 14px;
    font-size: 0.75rem;
  }

  .bloom-overlay {
    padding-bottom: 60px;
  }

  .fortune-step {
    min-height: calc(100vh - 160px);
  }

  .fortune-next-btn {
    bottom: 20px;
  }
}
</style>

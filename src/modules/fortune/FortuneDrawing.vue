<template>
  <div class="fortune-module">
    <!-- 星空背景 -->
    <div class="bg-stars" aria-hidden="true">
      <span v-for="i in 60" :key="'star-'+i" class="star" :style="starStyle(i)"></span>
    </div>
    <!-- 圆月 -->
    <div class="bg-moon" aria-hidden="true"></div>
    <!-- 飘落花瓣 -->
    <div class="bg-petals" aria-hidden="true">
      <span v-for="i in 16" :key="'petal-'+i" class="petal" :style="petalStyle(i)"></span>
    </div>

    <!-- 签筒区域 -->
    <div class="fortune-container" v-if="!drawnFortune">
      <div class="fortune-header-row">
        <div class="fortune-titles">
          <h3 class="fortune-title">求一支七夕签</h3>
          <p class="fortune-subtitle">心诚则灵，轻摇签筒，得月老指引</p>
        </div>
        <button v-if="!isShareMode" class="step-share-btn" @click.stop="emit('share-step')" title="分享此页面">分享</button>
      </div>

      <div class="canister-wrapper" @click="startShake" :class="{ shaking: isShaking }">
        <!-- 签筒 SVG -->
        <svg viewBox="0 0 160 240" class="canister-svg" ref="canisterRef">
          <!-- 底部光晕 -->
          <ellipse cx="80" cy="215" rx="70" ry="16" fill="rgba(251,191,36,0.22)" filter="blur(10px)" />

          <!-- 筒内后壁（让签子有"从里面长出来"的纵深） -->
          <ellipse cx="80" cy="118" rx="30" ry="8" fill="#1a0f0a" stroke="#2a1810" stroke-width="1.5"/>

          <!-- 签条们：底部汇聚在筒内，顶部向外散开 -->
          <g ref="sticksRef">
            <g v-for="i in stickCount" :key="'stick-group-'+i" class="fortune-stick-group">
              <line
                :x1="getStickTopX(i)"
                :y1="getStickTopY(i)"
                :x2="getStickBottomX(i)"
                :y2="getStickBottomY(i)"
                :stroke="getStickColor(i)"
                stroke-width="4.5"
                stroke-linecap="round"
                class="fortune-stick-svg"
                :style="{ transformOrigin: `${getStickBottomX(i)}px ${getStickBottomY(i)}px` }"
              />
              <!-- 签头红标 -->
              <circle
                :cx="getStickTopX(i)"
                :cy="getStickTopY(i)"
                r="5"
                fill="#dc2626"
                class="fortune-stick-tip"
                :style="{ transformOrigin: `${getStickBottomX(i)}px ${getStickBottomY(i)}px` }"
              />
              <!-- 签头金边 -->
              <circle
                :cx="getStickTopX(i)"
                :cy="getStickTopY(i) - 2"
                r="2.5"
                fill="#fbbf24"
                class="fortune-stick-gold"
                :style="{ transformOrigin: `${getStickBottomX(i)}px ${getStickBottomY(i)}px` }"
              />
            </g>
          </g>

          <!-- 筒身 -->
          <defs>
            <linearGradient id="bambooGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#4E342E"/>
              <stop offset="18%" stop-color="#6D4C41"/>
              <stop offset="40%" stop-color="#8D6E63"/>
              <stop offset="60%" stop-color="#795548"/>
              <stop offset="82%" stop-color="#5D4037"/>
              <stop offset="100%" stop-color="#3E2723"/>
            </linearGradient>
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3E2723"/>
              <stop offset="25%" stop-color="#D4AF37"/>
              <stop offset="50%" stop-color="#FDE68A"/>
              <stop offset="75%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#3E2723"/>
            </linearGradient>
            <pattern id="bambooPattern" x="0" y="0" width="16" height="12" patternUnits="userSpaceOnUse">
              <line x1="8" y1="0" x2="8" y2="12" stroke="#3E2723" stroke-width="1.2" opacity="0.35"/>
              <line x1="0" y1="10" x2="16" y2="10" stroke="#3E2723" stroke-width="0.8" opacity="0.2"/>
            </pattern>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- 筒身主体 -->
          <path d="M38,105 L32,205 Q32,215 46,215 L114,215 Q128,215 128,205 L122,105 Z"
                fill="url(#bambooGrad)" stroke="#3E2723" stroke-width="2"/>
          <path d="M38,105 L32,205 Q32,215 46,215 L114,215 Q128,215 128,205 L122,105 Z"
                fill="url(#bambooPattern)" opacity="0.5"/>

          <!-- 竹节金箍 -->
          <path d="M36,120 Q80,130 124,120" fill="none" stroke="#D4AF37" stroke-width="3.5" opacity="0.9"/>
          <path d="M34,190 Q80,200 126,190" fill="none" stroke="#D4AF37" stroke-width="3.5" opacity="0.9"/>

          <!-- 筒口：加厚度，更像真实圆环 -->
          <ellipse cx="80" cy="105" rx="45" ry="13" fill="url(#rimGrad)" stroke="#3E2723" stroke-width="2"/>
          <ellipse cx="80" cy="108" rx="38" ry="10" fill="#1a0f0a" stroke="#2a1810" stroke-width="1"/>
          <ellipse cx="80" cy="105" rx="36" ry="9" fill="#0d0705"/>

          <!-- 红色流苏 -->
          <g class="tassel">
            <line x1="118" y1="195" x2="134" y2="252" stroke="#b91c1c" stroke-width="3" stroke-linecap="round"/>
            <circle cx="134" cy="258" r="6" fill="#dc2626"/>
            <circle cx="134" cy="258" r="3" fill="#fbbf24"/>
          </g>
        </svg>
      </div>

      <button
        @click="startShake"
        :disabled="isShaking"
        class="shake-btn"
        :class="{ shaking: isShaking }"
      >
        <span class="btn-glow"></span>
        <span class="btn-text">{{ isShaking ? '摇签中...' : '点击摇签' }}</span>
      </button>
    </div>

    <!-- 弹出的签 -->
    <div v-if="drawnFortune" class="fortune-result ancient-card p-6 md:p-8">
      <!-- 签号 -->
      <div class="text-center mb-4">
        <span class="inline-block px-4 py-1 rounded-full text-sm font-serif"
              :class="levelClass">
          {{ drawnFortune.number }}
        </span>
      </div>

      <!-- 签诗 -->
      <div class="poem-section text-center mb-6">
        <p class="text-xl md:text-2xl font-serif text-amber-100 leading-relaxed mb-2">
          「{{ drawnFortune.poem }}」
        </p>
        <p class="text-sm text-amber-200/50 italic">
          —— {{ drawnFortune.poemAuthor }}
        </p>
      </div>

      <!-- 分隔线 -->
      <div class="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-6" />

      <!-- 解签 -->
      <div class="interpretation-section mb-6">
        <h4 class="text-sm text-amber-300/60 font-serif mb-2 text-center">解签</h4>
        <p class="text-base text-amber-100/80 leading-relaxed text-center font-serif">
          {{ drawnFortune.interpretation }}
        </p>
      </div>

      <!-- 分类标签 -->
      <div class="text-center mb-6">
        <span class="text-xs px-3 py-1 rounded-full bg-amber-900/30 text-amber-300/60 border border-amber-700/20">
          {{ drawnFortune.category }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-center gap-4">
        <button @click="drawAgain" class="action-btn secondary">再抽一次</button>
        <button @click="shareFortune" class="action-btn primary">分享此签</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import gsap from 'gsap';
import fortunesData from '../../data/fortunes/qixi.json';

interface Fortune {
  id: number;
  number: string;
  poem: string;
  poemAuthor: string;
  interpretation: string;
  level: string;
  category: string;
}

const fortunes: Fortune[] = fortunesData as Fortune[];

interface Props {
  initialFortuneId?: number;
  isShareMode?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'fortune-drawn', fortune: Fortune): void;
  (e: 'share-fortune', fortune: Fortune): void;
  (e: 'share-step'): void;
}>();

const canisterRef = ref<SVGElement>();
const sticksRef = ref<SVGGElement>();
const isShaking = ref(false);
const drawnFortune = ref<Fortune | null>(null);

// 如果通过分享链接进入，预置指定签文
if (props.initialFortuneId) {
  const found = fortunes.find(f => f.id === props.initialFortuneId);
  if (found) {
    drawnFortune.value = found;
    emit('fortune-drawn', found);
  }
}

const stickCount = 22;
const stickColors = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fde68a', '#b45309', '#92400e', '#fbbf24'];

function starStyle(i: number) {
  const size = 0.5 + Math.random() * 2;
  const left = Math.random() * 100;
  const top = Math.random() * 70;
  const delay = Math.random() * 4;
  const duration = 2 + Math.random() * 3;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

function petalStyle(i: number) {
  const size = 6 + Math.random() * 10;
  const left = Math.random() * 100;
  const delay = Math.random() * 6;
  const duration = 6 + Math.random() * 5;
  return {
    width: `${size}px`,
    height: `${size * 1.6}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

function getStickTopX(i: number) {
  // 签顶在筒口上方散开
  const spread = 46 + ((i - 1) / (stickCount - 1)) * 38;
  const jitter = Math.sin(i * 1.7) * 4 + (Math.random() - 0.5) * 3;
  return spread + jitter;
}

function getStickTopY(i: number) {
  // 签顶高低错落
  return 48 + Math.sin(i * 2.3) * 7 + (i % 3) * 2;
}

function getStickBottomX(i: number) {
  // 签底在筒内汇聚
  const center = 80 + Math.sin(i * 3.1) * 4;
  const jitter = (Math.random() - 0.5) * 3;
  return center + jitter;
}

function getStickBottomY(i: number) {
  // 签底深入筒内
  return 128 + Math.sin(i * 1.9) * 8 + (i % 4) * 3;
}

function getStickColor(i: number) {
  return stickColors[i % stickColors.length];
}

const levelClass = computed(() => {
  if (!drawnFortune.value) return '';
  const level = drawnFortune.value.level;
  if (level === '上上签') return 'bg-rose-600/30 text-rose-200 border border-rose-500/30';
  if (level === '上签') return 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30';
  return 'bg-amber-600/30 text-amber-200 border border-amber-500/30';
});

function startShake() {
  if (isShaking.value) return;
  isShaking.value = true;

  const canister = canisterRef.value;
  if (!canister) {
    doDraw();
    return;
  }

  // GSAP 签筒摇晃动画
  const tl = gsap.timeline({
    onComplete: () => {
      // 中签：整组签条弹出并发光
      const stickGroups = sticksRef.value?.querySelectorAll('.fortune-stick-group');
      if (stickGroups && stickGroups.length > 0) {
        const randomIndex = Math.floor(Math.random() * stickGroups.length);
        const luckyGroup = stickGroups[randomIndex];
        gsap.to(luckyGroup, {
          y: -80,
          rotation: 8,
          duration: 0.6,
          ease: 'power2.out',
        });
        gsap.to(luckyGroup.querySelectorAll('rect'), {
          filter: 'url(#glow)',
          duration: 0.3,
          yoyo: true,
          repeat: 3,
        });
        setTimeout(doDraw, 900);
      } else {
        doDraw();
      }
    }
  });

  // 摇晃动画
  tl.to(canister, { rotation: -10, duration: 0.1, ease: 'power1.inOut' })
    .to(canister, { rotation: 10, duration: 0.15, ease: 'power1.inOut' })
    .to(canister, { rotation: -8, duration: 0.12, ease: 'power1.inOut' })
    .to(canister, { rotation: 8, duration: 0.15, ease: 'power1.inOut' })
    .to(canister, { rotation: -6, duration: 0.12, ease: 'power1.inOut' })
    .to(canister, { rotation: 6, duration: 0.15, ease: 'power1.inOut' })
    .to(canister, { rotation: -4, duration: 0.1, ease: 'power1.inOut' })
    .to(canister, { rotation: 4, duration: 0.12, ease: 'power1.inOut' })
    .to(canister, { rotation: -2, duration: 0.1, ease: 'power1.inOut' })
    .to(canister, { rotation: 0, duration: 0.15, ease: 'power1.out' });

  // 签条集体上下抖动
  const stickGroups = sticksRef.value?.querySelectorAll('.fortune-stick-group');
  if (stickGroups) {
    stickGroups.forEach((group, i) => {
      gsap.to(group, {
        y: -8 - Math.random() * 10,
        rotation: (Math.random() - 0.5) * 12,
        duration: 0.18,
        repeat: 7,
        yoyo: true,
        delay: i * 0.02,
        ease: 'power1.inOut',
      });
    });
  }
}

function doDraw() {
  const randomIndex = Math.floor(Math.random() * fortunes.length);
  drawnFortune.value = fortunes[randomIndex];
  isShaking.value = false;
  emit('fortune-drawn', drawnFortune.value);
}

function drawAgain() {
  drawnFortune.value = null;
  // 重置签条位置
  const stickGroups = sticksRef.value?.querySelectorAll('.fortune-stick-group');
  if (stickGroups) {
    stickGroups.forEach(group => {
      gsap.set(group, { y: 0, rotation: 0 });
      gsap.set(group.querySelectorAll('rect'), { filter: 'none' });
    });
  }
}

function shareFortune() {
  if (drawnFortune.value) {
    emit('share-fortune', drawnFortune.value);
  }
}
</script>

<style scoped>
.fortune-module {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 180px);
  margin: 0 auto;
  padding: 20px;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 30%, #1a1040 0%, #0e0828 40%, #080418 80%, #03020a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 星空 */
.bg-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.7;
  animation: twinkle linear infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 圆月 */
.bg-moon {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffbeb 0%, #fef3c7 30%, #fde68a 70%, #fbbf24 100%);
  box-shadow: 0 0 60px rgba(251, 191, 36, 0.25), 0 0 120px rgba(251, 191, 36, 0.1);
  opacity: 0.9;
  pointer-events: none;
  z-index: 0;
}

/* 花瓣 */
.bg-petals {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.petal {
  position: absolute;
  top: -30px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(to bottom, rgba(244, 114, 182, 0.7), rgba(254, 205, 211, 0.4));
  opacity: 0.65;
  animation: fallPetals linear infinite;
}
@keyframes fallPetals {
  0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
  10% { opacity: 0.65; }
  90% { opacity: 0.65; }
  100% { transform: translateY(110vh) rotate(360deg) translateX(40px); opacity: 0; }
}

.fortune-container {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;
  max-width: 480px;
}

.fortune-header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.fortune-titles {
  text-align: center;
}

.fortune-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.75rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(244, 63, 94, 0.35);
}

.fortune-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0;
  font-family: 'Noto Serif SC', serif;
}

.step-share-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
}

.step-share-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.canister-wrapper {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s;
  filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.5));
}

.canister-wrapper:hover {
  transform: scale(1.04);
}

.canister-wrapper.shaking {
  animation: canisterShake 0.8s ease-in-out;
}

@keyframes canisterShake {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-6deg); }
  20% { transform: rotate(6deg); }
  30% { transform: rotate(-5deg); }
  40% { transform: rotate(5deg); }
  50% { transform: rotate(-4deg); }
  60% { transform: rotate(4deg); }
  70% { transform: rotate(-2deg); }
  80% { transform: rotate(2deg); }
  90% { transform: rotate(-1deg); }
}

.canister-svg {
  width: 180px;
  height: 270px;
}

.fortune-stick-svg,
.fortune-stick-tip,
.fortune-stick-gold {
  transition: transform 0.3s;
}

.tassel {
  transform-origin: 118px 195px;
  animation: tasselSway 3s ease-in-out infinite;
}
@keyframes tasselSway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(3deg); }
}

.shake-btn {
  position: relative;
  display: block;
  margin: 2rem auto 0;
  padding: 12px 40px;
  border-radius: 9999px;
  border: 1px solid rgba(251, 191, 36, 0.4);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.15));
  color: rgba(254, 240, 138, 0.95);
  font-size: 1rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.shake-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.28), rgba(217, 119, 6, 0.28));
  border-color: rgba(251, 191, 36, 0.7);
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);
  transform: translateY(-2px);
}

.shake-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(251, 191, 36, 0.25), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.shake-btn:hover:not(:disabled) .btn-glow {
  opacity: 1;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.fortune-result {
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
  background: rgba(20, 12, 40, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-btn {
  padding: 10px 28px;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid;
}

.action-btn.primary {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2));
  border-color: rgba(244, 63, 94, 0.3);
  color: rgba(244, 63, 94, 0.9);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(225, 29, 72, 0.3));
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.15);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}
</style>

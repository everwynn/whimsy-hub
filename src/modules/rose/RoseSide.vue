<template>
  <div class="rose-side-module">
    <!-- 与鹊桥同款的星空背景 -->
    <div class="bg-stars" aria-hidden="true">
      <span v-for="i in 80" :key="'star-'+i" class="star" :style="starStyle(i)"></span>
    </div>
    <div class="bg-moon" aria-hidden="true"></div>
    <div class="bg-petals" aria-hidden="true">
      <span v-for="i in 18" :key="'petal-'+i" class="petal" :style="petalStyle(i)"></span>
    </div>

    <canvas ref="canvasRef" class="rose-canvas"></canvas>

    <div class="rose-overlay">
      <p class="rose-hint">{{ hintText }}</p>
      <div class="rose-actions">
        <button v-if="autoPlayDone" class="replay-btn" @click="replay">再次绽放</button>
        <button v-if="!isShareMode" class="share-icon-btn" @click="shareRose" title="分享此页面">分享</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { buildShareUrl } from '../../utils/shareCodec';

interface Props {
  isShareMode?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'share-step'): void;
}>();

const canvasRef = ref<HTMLCanvasElement>();
const autoPlayDone = ref(false);
const hintText = ref('一朵玫瑰，从枝头悄然绽放...');

let rafId = 0;
let startTime = 0;
const DURATION = 12000; // 12秒绽放

function starStyle(i: number) {
  const size = 0.5 + Math.random() * 2.5;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 70}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
  };
}

function petalStyle(i: number) {
  const size = 6 + Math.random() * 10;
  return {
    width: `${size}px`,
    height: `${size * 1.6}px`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${6 + Math.random() * 5}s`,
  };
}

function ease(t: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function hexToRgb(hex: string, offset = 0) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + offset));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + offset));
  const b = Math.min(255, Math.max(0, (n & 0xff) + offset));
  return `rgb(${r},${g},${b})`;
}

function initCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number, side: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + (side === 1 ? 0.4 : -0.4));
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-12, -18, -8, -42, 0, -55);
  ctx.bezierCurveTo(8, -42, 12, -18, 0, 0);
  const grad = ctx.createLinearGradient(0, 0, 0, -55);
  grad.addColorStop(0, '#14532d');
  grad.addColorStop(0.5, '#166534');
  grad.addColorStop(1, '#22c55e');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function drawPetal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  layer: number,
  index: number,
  total: number,
  bloomProgress: number,
  time: number
) {
  const angle = (index / total) * Math.PI * 2 + layer * 0.25 + time * 0.0005;
  const baseLen = 35 + layer * 22;
  const len = baseLen * bloomProgress;
  const width = (14 + layer * 6) * bloomProgress;
  const outward = layer * 8 * bloomProgress;

  const colors = ['#dc2626', '#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#be123c', '#9f1239'];
  const color = colors[(layer + index) % colors.length];

  ctx.save();
  ctx.translate(cx + Math.cos(angle) * outward, cy + Math.sin(angle) * outward * 0.4);
  ctx.rotate(angle - Math.PI / 2);

  // 侧面视角：花瓣向上展开
  const openAngle = -0.2 - bloomProgress * 0.6 - layer * 0.05;
  ctx.rotate(openAngle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-width * 0.6, -len * 0.35, -width * 0.25, -len * 0.85, 0, -len);
  ctx.bezierCurveTo(width * 0.25, -len * 0.85, width * 0.6, -len * 0.35, 0, 0);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, -len);
  grad.addColorStop(0, color);
  grad.addColorStop(0.5, hexToRgb(color, 25));
  grad.addColorStop(1, hexToRgb(color, 50));
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.85 + bloomProgress * 0.15;
  ctx.fill();

  ctx.strokeStyle = hexToRgb(color, -20);
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.3 * bloomProgress;
  ctx.stroke();
  ctx.restore();
}

function drawRose(ctx: CanvasRenderingContext2D, cx: number, cy: number, progress: number, time: number) {
  const stemProg = ease(Math.min(1, progress * 1.5));
  const leafProg = ease(Math.min(1, Math.max(0, (progress - 0.2) / 0.4)));
  const bloomProg = ease(Math.min(1, Math.max(0, (progress - 0.45) / 0.55)));

  // 茎：从侧面看是向上生长的曲线
  const stemHeight = 280 * stemProg;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-8, -stemHeight * 0.3, 8, -stemHeight * 0.7, 0, -stemHeight);
  const stemGrad = ctx.createLinearGradient(0, 0, 0, -stemHeight);
  stemGrad.addColorStop(0, '#14532d');
  stemGrad.addColorStop(1, '#166534');
  ctx.strokeStyle = stemGrad;
  ctx.lineWidth = 7 * stemProg;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 叶子
  if (leafProg > 0) {
    drawLeaf(ctx, -3, -stemHeight * 0.35, -0.3, leafProg, -1);
    drawLeaf(ctx, 3, -stemHeight * 0.62, 0.2, leafProg * 0.9, 1);
  }

  // 花苞/花朵在茎顶
  const headX = 0;
  const headY = -stemHeight;

  // 外层花瓣先画（后层）
  for (let layer = 4; layer >= 0; layer--) {
    const count = 5 + layer * 2;
    for (let i = 0; i < count; i++) {
      const stagger = layer * 0.08;
      const p = Math.min(1, Math.max(0, (bloomProg - stagger) / (1 - stagger)));
      if (p <= 0) continue;
      drawPetal(ctx, headX, headY, layer, i, count, p, time);
    }
  }

  // 花蕊
  if (bloomProg > 0.3) {
    const centerProg = Math.min(1, (bloomProg - 0.3) / 0.7);
    ctx.beginPath();
    ctx.arc(headX, headY, 5 + 4 * centerProg, 0, Math.PI * 2);
    const cg = ctx.createRadialGradient(headX, headY, 0, headX, headY, 10);
    cg.addColorStop(0, '#fbbf24');
    cg.addColorStop(0.6, '#f59e0b');
    cg.addColorStop(1, 'rgba(217,119,6,0)');
    ctx.fillStyle = cg;
    ctx.globalAlpha = centerProg;
    ctx.fill();
  }

  ctx.restore();
}

let sparkles: any[] = [];
let falling: any[] = [];

function drawEffects(ctx: CanvasRenderingContext2D, cx: number, cy: number, progress: number, time: number) {
  if (progress < 0.4) return;

  // 闪光点
  if (progress > 0.5 && Math.random() < 0.3 && sparkles.length < 50) {
    const angle = Math.random() * Math.PI * 2;
    sparkles.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy - 180 + (Math.random() - 0.5) * 40,
      s: 1 + Math.random() * 2.5,
      a: 0.5 + Math.random() * 0.5,
      sp: 0.3 + Math.random() * 1.2,
      ag: angle,
      lf: 0,
      ml: 50 + Math.random() * 70,
    });
  }

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.x += Math.cos(s.ag) * s.sp;
    s.y += Math.sin(s.ag) * s.sp;
    s.lf++;
    if (s.lf >= s.ml) {
      sparkles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = s.a * (1 - s.lf / s.ml);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.s * (1 - s.lf / s.ml), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 飘落花瓣
  if (progress >= 1 && Math.random() < 0.05 && falling.length < 18) {
    const fc = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];
    falling.push({
      x: cx + (Math.random() - 0.5) * 160,
      y: cy - 240 + Math.random() * 40,
      sz: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.03,
      fs: 0.4 + Math.random() * 0.8,
      sa: 25 + Math.random() * 30,
      ss: 0.01 + Math.random() * 0.02,
      al: 0.8,
      co: fc[Math.floor(Math.random() * fc.length)],
      tm: 0,
    });
  }

  for (let i = falling.length - 1; i >= 0; i--) {
    const f = falling[i];
    f.y += f.fs;
    f.rot += f.rs;
    f.tm += 0.016;
    f.al -= 0.002;
    if (f.y > window.innerHeight + 20 || f.al <= 0) {
      falling.splice(i, 1);
      continue;
    }
    const sx = Math.sin(f.tm * f.ss * 60) * f.sa;
    ctx.save();
    ctx.translate(f.x + sx, f.y);
    ctx.rotate(f.rot);
    ctx.globalAlpha = f.al;
    ctx.beginPath();
    ctx.ellipse(0, 0, f.sz * 0.4, f.sz, 0, 0, Math.PI * 2);
    ctx.fillStyle = f.co;
    ctx.fill();
    ctx.restore();
  }
}

function render(time: number) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  if (!startTime) startTime = time;
  const elapsed = time - startTime;
  const progress = Math.min(1, elapsed / DURATION);

  // 玫瑰从画面底部偏上位置生长
  const cx = w * 0.5;
  const cy = h * 0.85;

  drawRose(ctx, cx, cy, progress, time);
  drawEffects(ctx, cx, cy, progress, time);

  if (progress >= 1 && !autoPlayDone.value) {
    autoPlayDone.value = true;
    hintText.value = '玫瑰已为你绽放 · 愿爱意长存';
  }

  rafId = requestAnimationFrame(render);
}

function startAnimation() {
  startTime = 0;
  autoPlayDone.value = false;
  hintText.value = '一朵玫瑰，从枝头悄然绽放...';
  sparkles = [];
  falling = [];
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(render);
}

function replay() {
  startAnimation();
}

function shareRose() {
  emit('share-step');
}

onMounted(() => {
  const cleanup = initCanvas();
  startAnimation();
  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (cleanup) cleanup();
  });
});
</script>

<style scoped>
.rose-side-module {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 30%, #1a1040 0%, #0e0828 40%, #080418 80%, #03020a 100%);
  z-index: 5;
}

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

.rose-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.rose-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-bottom: 80px;
  z-index: 10;
  pointer-events: none;
}

.rose-overlay > * {
  pointer-events: auto;
}

.rose-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Noto Serif SC', serif;
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
  text-align: center;
  padding: 0 20px;
}

.rose-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-icon-btn {
  padding: 8px 18px;
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

.replay-btn {
  padding: 10px 28px;
  border-radius: 9999px;
  border: 1px solid rgba(244, 63, 94, 0.35);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(225, 29, 72, 0.12));
  backdrop-filter: blur(8px);
  color: rgba(244, 63, 95, 0.9);
  font-size: 0.85rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
}

.replay-btn:hover {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(225, 29, 72, 0.22));
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.15);
}
</style>

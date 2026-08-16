<template>
  <div class="share-panel">
    <div class="share-header-row">
      <h3 class="share-title">分享祝福</h3>
      <button v-if="!isShareMode" class="step-share-btn" @click="shareCurrentPage" title="分享此页面">分享</button>
    </div>

    <!-- 发送人/接收人输入 -->
    <div class="input-group">
      <div class="input-row">
        <label>发送人</label>
        <input v-model="fromName" type="text" placeholder="你的名字" class="share-input" maxlength="20" />
      </div>
      <div class="input-row">
        <label>接收人</label>
        <input v-model="toName" type="text" placeholder="TA的名字" class="share-input" maxlength="20" />
      </div>
    </div>

    <!-- 祝福留言 -->
    <div class="input-row">
      <label>祝福留言（可选）</label>
      <textarea v-model="message" placeholder="写下你的祝福..." class="share-textarea" maxlength="200" />
    </div>

    <!-- 生成链接 -->
    <button @click="generateLink" class="generate-btn" :disabled="!canGenerate">
      生成祝福链接
    </button>

    <!-- 结果展示 -->
    <div v-if="generatedLink" class="link-result">
      <div class="link-box">
        <input :value="generatedLink" readonly class="link-input" ref="linkInputRef" @click="selectAll" />
        <button @click="copyLink" class="copy-btn">
          {{ copied ? '已复制!' : '复制' }}
        </button>
      </div>
      <p class="link-hint">链接有效期：7天 · 打开即可查看祝福</p>
    </div>

    <!-- 下载HTML -->
    <div class="download-section">
      <button @click="downloadHtml" class="download-btn">
        下载独立HTML文件
      </button>
      <p class="download-hint">下载后可直接在任意设备打开播放</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { buildShareUrl } from '../../utils/shareCodec';

interface Props {
  festivalId: string;
  fortuneId?: number;
  isShareMode?: boolean;
}

const props = defineProps<Props>();

const fromName = ref('');
const toName = ref('');
const message = ref('');
const generatedLink = ref('');
const copied = ref(false);
const linkInputRef = ref<HTMLInputElement>();

const canGenerate = computed(() => fromName.value.trim() && toName.value.trim());

function generateLink() {
  if (!canGenerate.value) return;

  generatedLink.value = buildShareUrl({
    festivalId: props.festivalId,
    step: 2,
    from: fromName.value.trim(),
    to: toName.value.trim(),
    msg: message.value.trim() || undefined,
    fortuneId: props.fortuneId,
  });
  copied.value = false;
}

function shareCurrentPage() {
  const url = buildShareUrl({ festivalId: props.festivalId, step: 2 });
  copyToClipboard(url, '分享页面链接已复制');
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

async function copyLink() {
  if (!generatedLink.value) return;
  try {
    await navigator.clipboard.writeText(generatedLink.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // fallback
    if (linkInputRef.value) {
      linkInputRef.value.select();
      document.execCommand('copy');
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
    }
  }
}

function selectAll(e: Event) {
  (e.target as HTMLInputElement).select();
}

function downloadHtml() {
  const html = generateStandaloneHtml();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `七夕祝福_${toName.value || '祝福'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateStandaloneHtml(): string {
  const from = fromName.value.trim() || '匿名';
  const to = toName.value.trim() || '你';
  const msg = message.value.trim() || '愿你幸福安康，万事如意。';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>七夕祝福 - 来自${from}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
body{background:linear-gradient(135deg,#0c0a1a 0%,#1a0a2e 30%,#2d1052 60%,#1a0a2e 100%);
font-family:'Georgia','Noto Serif SC',serif;color:#fff;display:flex;flex-direction:column;
align-items:center;justify-content:center;position:relative}
canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0}
.content{position:relative;z-index:10;text-align:center;padding:20px;max-width:600px}
.from-text{font-size:14px;color:rgba(251,191,136,0.6);margin-bottom:8px;letter-spacing:2px}
.to-name{font-size:28px;font-weight:bold;
background:linear-gradient(to right,#fda4af,#f43f5e);
-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:20px}
.message{font-size:16px;color:rgba(255,255,255,0.8);line-height:2;margin-bottom:24px;
font-style:italic;opacity:0;animation:fadeIn 2s ease-out 8s forwards}
.signature{font-size:13px;color:rgba(255,255,255,0.3);opacity:0;animation:fadeIn 2s ease-out 10s forwards}
.title{font-size:20px;color:rgba(255,255,255,0.7);margin-bottom:30px;letter-spacing:4px;
opacity:0;animation:fadeIn 1.5s ease-out 1s forwards}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.stars{position:fixed;inset:0;pointer-events:none;z-index:1}
.stars::before{content:'';position:absolute;inset:0;
background-image:radial-gradient(2px 2px at 20% 30%,rgba(255,255,255,0.3),transparent),
radial-gradient(1px 1px at 60% 20%,rgba(255,255,255,0.4),transparent),
radial-gradient(2px 2px at 40% 70%,rgba(255,255,255,0.2),transparent),
radial-gradient(1px 1px at 80% 50%,rgba(255,255,255,0.2),transparent);
animation:twinkle 4s ease-in-out infinite alternate}
@keyframes twinkle{0%{opacity:0.5}100%{opacity:1}}
</style>
</head>
<body>
<div class="stars"></div>
<canvas id="c"></canvas>
<div class="content">
  <p class="title">~ 七夕快乐 ~</p>
  <p class="from-text">来自 ${from} 的祝福</p>
  <h1 class="to-name">Dear ${to}</h1>
  <p class="message">${msg}</p>
  <p class="signature">Whimsy Hub · 用心传递每一份祝福</p>
</div>
<script>
(function(){
var c=document.getElementById('c'),x=c.getContext('2d');
var W,H,cX,cY,dpr=window.devicePixelRatio||1;
function resize(){W=c.width=innerWidth*dpr;H=c.height=innerHeight*dpr;
c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';
x.scale(dpr,dpr);cX=innerWidth/2;cY=innerHeight*0.35}
resize();window.addEventListener('resize',function(){x.setTransform(1,0,0,1,0,0);resize()});

var petals=[],colors=['#dc2626','#e11d48','#f43f5e','#fb7185','#fda4af','#be123c','#9f1239','#ff6b8a'];
for(var l=0;l<5;l++){var n=8+l*2;for(var i=0;i<n;i++){
petals.push({a:(i/n)*Math.PI*2+l*0.2,l:l,len:30+l*18+Math.random()*10,
w:15+l*5+Math.random()*5,c:colors[Math.floor(Math.random()*colors.length)],
d:l*0.12+Math.random()*0.05,so:Math.random()*Math.PI*2,ss:0.5+Math.random()})}}

var sparkles=[],falling=[];
var start=performance.now(),DUR=10000;

function ease(t){return 1-Math.pow(1-t,3)}
function lc(h,p){var n=parseInt(h.replace('#',''),16);
var r=Math.min(255,Math.max(0,(n>>16)+p));
var g=Math.min(255,Math.max(0,((n>>8)&0xff)+p));
var b=Math.min(255,Math.max(0,(n&0xff)+p));
return'rgb('+r+','+g+','+b+')'}

function drawPetal(p,prog,t){
var pp=Math.max(0,Math.min(1,(prog-p.d)/(1-p.d)));if(pp<=0)return;
var e=ease(pp),sw=Math.sin(t*p.ss+p.so)*0.03*e;
var a=p.a+sw,cl=p.len*e,cw=p.w*e;
x.save();x.translate(cX,cY);x.rotate(a);
x.rotate(-Math.PI/2+p.l*0.15*e);
x.beginPath();x.moveTo(0,0);
x.bezierCurveTo(-cw*0.6,-cl*0.4,-cw*0.3,-cl*0.9,0,-cl);
x.bezierCurveTo(cw*0.3,-cl*0.9,cw*0.6,-cl*0.4,0,0);
x.closePath();
var g=x.createLinearGradient(0,0,0,-cl);
g.addColorStop(0,p.c);g.addColorStop(0.5,lc(p.c,20));g.addColorStop(1,lc(p.c,40));
x.fillStyle=g;x.globalAlpha=0.7+e*0.3;x.fill();
x.strokeStyle=lc(p.c,-15);x.lineWidth=0.5;x.globalAlpha=0.3*e;x.stroke();
x.restore()}

function drawStem(prog){var sp=Math.min(1,prog*2);if(sp<=0)return;
var sh=120*ease(sp);x.save();x.translate(cX,cY);
x.beginPath();x.moveTo(0,0);x.bezierCurveTo(-3,sh*0.3,3,sh*0.6,0,sh);
x.strokeStyle='#166534';x.lineWidth=4;x.stroke();
if(sp>0.4){var lp=ease(Math.min(1,(sp-0.4)/0.3)),s=30*lp;
x.save();x.translate(-2,sh*0.4);x.rotate(-0.8);
x.beginPath();x.moveTo(0,0);
x.bezierCurveTo(-s*0.3,-s*0.3,-s*0.1,-s*0.8,0,-s);
x.bezierCurveTo(s*0.1,-s*0.8,s*0.3,-s*0.3,0,0);
var lg=x.createLinearGradient(0,0,0,-s);lg.addColorStop(0,'#166534');lg.addColorStop(1,'#22c55e');
x.fillStyle=lg;x.globalAlpha=0.8;x.fill();x.restore()}
if(sp>0.6){var lp2=ease(Math.min(1,(sp-0.6)/0.3)),s2=25*lp2;
x.save();x.translate(2,sh*0.6);x.rotate(0.6);
x.beginPath();x.moveTo(0,0);
x.bezierCurveTo(-s2*0.3,-s2*0.3,-s2*0.1,-s2*0.8,0,-s2);
x.bezierCurveTo(s2*0.1,-s2*0.8,s2*0.3,-s2*0.3,0,0);
var lg2=x.createLinearGradient(0,0,0,-s2);lg2.addColorStop(0,'#166534');lg2.addColorStop(1,'#22c55e');
x.fillStyle=lg2;x.globalAlpha=0.8;x.fill();x.restore()}
x.restore()}

function drawCenter(prog){if(prog<0.05)return;var p=Math.min(1,prog*3);
x.save();x.translate(cX,cY);var r=6*ease(p);
var g=x.createRadialGradient(0,0,0,0,0,r);
g.addColorStop(0,'#fbbf24');g.addColorStop(0.6,'#f59e0b');g.addColorStop(1,'#d97706');
x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.fillStyle=g;x.globalAlpha=p;x.fill();
var gr=r*3;var gw=x.createRadialGradient(0,0,r,0,0,gr);
gw.addColorStop(0,'rgba(251,191,36,0.3)');gw.addColorStop(1,'rgba(251,191,36,0)');
x.beginPath();x.arc(0,0,gr,0,Math.PI*2);x.fillStyle=gw;x.fill();x.restore()}

function render(ts){var el=ts-start,prog=Math.min(1,el/DUR),t=ts/1000;
x.clearRect(0,0,innerWidth,innerHeight);
drawStem(prog);
var sp=petals.slice().sort(function(a,b){return b.l-a.l});
for(var i=0;i<sp.length;i++)drawPetal(sp[i],prog,t);
drawCenter(prog);
if(prog>0.3&&Math.random()<0.3&&sparkles.length<40){
var sa=Math.random()*Math.PI*2;
sparkles.push({x:cX+(Math.random()-0.5)*20,y:cY+(Math.random()-0.5)*20,
s:1+Math.random()*2.5,a:0.5+Math.random()*0.5,sp:0.3+Math.random()*1.5,
ag:sa,lf:0,ml:40+Math.random()*60})}
for(var j=sparkles.length-1;j>=0;j--){var s=sparkles[j];
s.x+=Math.cos(s.ag)*s.sp;s.y+=Math.sin(s.ag)*s.sp;s.lf++;
if(s.lf>=s.ml){sparkles.splice(j,1);continue}
x.save();x.globalAlpha=s.a*(1-s.lf/s.ml);x.fillStyle='#fef08a';
x.shadowColor='#fbbf24';x.shadowBlur=6;
x.beginPath();x.arc(s.x,s.y,s.s*(1-s.lf/s.ml),0,Math.PI*2);
x.fill();x.restore()}
if(prog>=1&&Math.random()<0.05&&falling.length<15){
var fc=['#f43f5e','#fb7185','#fda4af','#fecdd3'];
falling.push({x:cX+(Math.random()-0.5)*100,y:cY-20+Math.random()*40,
sz:6+Math.random()*10,rot:Math.random()*Math.PI*2,rs:(Math.random()-0.5)*0.03,
fs:0.3+Math.random()*0.8,sa:20+Math.random()*30,ss:0.01+Math.random()*0.02,
al:0.8,co:fc[Math.floor(Math.random()*fc.length)],tm:0})}
for(var k=falling.length-1;k>=0;k--){var f=falling[k];
f.y+=f.fs;f.rot+=f.rs;f.tm+=0.016;f.al-=0.002;
if(f.y>innerHeight+20||f.al<=0){falling.splice(k,1);continue}
var sx=Math.sin(f.tm*f.ss*60)*f.sa;
x.save();x.translate(f.x+sx,f.y);x.rotate(f.rot);x.globalAlpha=f.al;
x.beginPath();x.ellipse(0,0,f.sz*0.4,f.sz,0,0,Math.PI*2);
x.fillStyle=f.co;x.fill();x.restore()}
requestAnimationFrame(render)}
requestAnimationFrame(render)})();
<\\/script>
</body>
</html>`;
}
</script>

<style scoped>
.share-panel {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.share-header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.share-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 0;
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

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-row {
  flex: 1;
  margin-bottom: 1rem;
}

.input-row label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.375rem;
  font-family: 'Noto Serif SC', serif;
}

.share-input, .share-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.3s;
}

.share-input:focus, .share-textarea:focus {
  border-color: rgba(244, 63, 94, 0.4);
}

.share-textarea {
  resize: none;
  height: 70px;
  font-family: 'Noto Serif SC', serif;
}

.generate-btn {
  display: block;
  width: 100%;
  padding: 10px;
  border-radius: 9999px;
  border: 1px solid rgba(244, 63, 94, 0.3);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(225, 29, 72, 0.15));
  color: rgba(244, 63, 94, 0.9);
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.generate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(225, 29, 72, 0.25));
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
}

.generate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.link-result {
  margin-bottom: 1.5rem;
}

.link-box {
  display: flex;
  gap: 8px;
}

.link-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  outline: none;
  cursor: pointer;
}

.copy-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.1);
  color: rgba(244, 63, 94, 0.8);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: rgba(244, 63, 94, 0.2);
}

.link-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.25);
  text-align: center;
  margin-top: 0.5rem;
}

.download-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.download-btn {
  padding: 10px 28px;
  border-radius: 9999px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.1));
  color: rgba(168, 85, 247, 0.9);
  font-size: 0.875rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
}

.download-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 0.5rem;
}
</style>

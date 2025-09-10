// StreetVoice 內嵌：滿版等比 + 可視高度裁切 + 標題列
(function(){
  const BASE_W = 330, BASE_H = 100;
  const selector = 'iframe[src*="streetvoice.com/music/embed"]';

  function ensureCard(iframe){
    // 外層卡片
    let card = iframe.closest('.sv-card');
    if(!card){
      card = document.createElement('div');
      card.className = 'sv-card';
      iframe.parentElement.insertBefore(card, iframe);
      card.appendChild(iframe);
    }
    // 內層容器
    let box = iframe.closest('.sv-embed');
    if(!box){
      box = document.createElement('div');
      box.className = 'sv-embed';
      card.insertBefore(box, iframe);
      box.appendChild(iframe);
    }
    // 標題列（只建一次；可用 data-sv-title 覆蓋文字）
    let title = card.querySelector('.sv-titlebar');
    const text = iframe.dataset.svTitle || '來聽點音樂吧～';
    if(!title){
      title = document.createElement('div');
      title.className = 'sv-titlebar';
      title.textContent = text;
      card.insertBefore(title, box);
    }else if(iframe.dataset.svTitle){
      title.textContent = text;
    }

    // 基本外觀
    card.style.borderRadius = '16px';
    card.style.padding = '14px 16px';
    card.style.margin = '12px 0 18px';
    card.style.background = 'linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.75))';
    card.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)';
    card.style.backdropFilter = 'blur(6px)';

    box.style.width = '100%';
    box.style.overflow = 'hidden';
    box.style.borderRadius = '12px';

    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.transformOrigin = 'top left';

    return { card, box };
  }

  function getCrop(iframe){
    const v =
      iframe.dataset.svCrop ||
      iframe.closest('.sv-card')?.dataset.svCrop ||
      iframe.closest('.sv-embed')?.dataset.svCrop;
    const r = parseFloat(v);
    return (r > 0 && r <= 1) ? r : 1; // 預設不裁
  }

  function getAlign(iframe){
    const v =
      (iframe.dataset.svAlign ||
       iframe.closest('.sv-card')?.dataset.svAlign ||
       iframe.closest('.sv-embed')?.dataset.svAlign || 'center').toLowerCase();
    return (v === 'top' || v === 'bottom') ? v : 'center';
  }

  function fitOne(iframe){
    const { box } = ensureCard(iframe);

    const w = box.clientWidth || BASE_W;
    const scale = w / BASE_W;

    // 固定原始尺寸，再用 scale 放大
    iframe.style.width  = BASE_W + 'px';
    iframe.style.height = BASE_H + 'px';

    // 計算裁切後高度
    const crop  = getCrop(iframe);       // 0~1
    const fullH = BASE_H * scale;
    const visH  = fullH * crop;

    // 垂直對齊
    const align = getAlign(iframe);
    let offsetY = 0;
    if (crop < 1) {
      if (align === 'center')      offsetY = (fullH - visH) / 2;
      else if (align === 'bottom') offsetY = (fullH - visH);
    }

    iframe.style.transform = `translateY(-${offsetY}px) scale(${scale})`;
    box.style.height = visH + 'px';
  }

  function fitAll(){
    document.querySelectorAll(selector).forEach(fitOne);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    fitAll();
    setTimeout(fitAll, 300);
    setTimeout(fitAll, 1000);
  });
  window.addEventListener('resize', fitAll);
})();

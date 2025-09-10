/* 手動翻頁版（無自動播放） */
(function () {
  const wrap = document.getElementById('history_container_wrapper');
  if (!wrap) return;

  const lang = 'zh';
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const feedUrl = `https://api.wikimedia.org/feed/v1/wikipedia/${lang}/onthisday/all/${mm}/${dd}`;
  const cacheKey = `HISTORY_TODAY_${lang}_${mm}${dd}`;

  function render(list){
    wrap.innerHTML = '';
    list.forEach(item => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <div class="history-year">A.D.${item.year}</div>
        <div class="history-text">${item.text}</div>
      `;
      if (item.link) slide.addEventListener('click', () => window.open(item.link, '_blank'));
      wrap.appendChild(slide);
    });
  }

  function createSwiper(){
    if (window.__historySwiper__) window.__historySwiper__.destroy(true, true);
    window.__historySwiper__ = new Swiper('#history-container', {
      direction: 'vertical',
      effect: 'slide',
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,                    // ✅ 手動翻頁，不循環
      centeredSlides: false,
      speed: 1000,
      resistanceRatio: 0,             // ✅ 取消彈性，卡位更準
      allowTouchMove: true,           // ✅ 觸控/拖曳翻頁
      mousewheel: { forceToAxis: true, releaseOnEdges: true, sensitivity: 0.7 }, // ✅ 滾輪翻頁
      keyboard: { enabled: true, onlyInViewport: true }                           // ✅ 鍵盤上下
    });
  }

  function run(list){ render(list); createSwiper(); }

  // 先用快取即時顯示（若有）
  try {
    const cache = localStorage.getItem(cacheKey);
    if (cache) { const quick = JSON.parse(cache); if (quick?.length) run(quick); }
  } catch (_) {}

  // 再抓 API 更新
  fetch(feedUrl)
    .then(r => r.json())
    .then(data => {
      const events = Array.isArray(data?.events) ? data.events : [];
      const list = events.slice(0, 15).map(ev => {
        const p = (ev.pages && ev.pages[0]) || {};
        const link = p?.content_urls?.desktop?.page || p?.content_urls?.mobile?.page || '';
        return { year: ev.year, text: ev.text, link };
      });
      localStorage.setItem(cacheKey, JSON.stringify(list));
      run(list);
    })
    .catch(() => run([{ year: '—', text: '載入失敗，請稍後再試', link: '' }]));
})();

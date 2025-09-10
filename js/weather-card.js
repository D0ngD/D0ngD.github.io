(function () {
  // 取得卡片容器；沒有就不執行（避免其他頁面報錯）
  const box = document.querySelector('.kira-widget-wrap.card-weather');
  if (!box) return;

  // 台北座標；也可改 data-lat / data-lon 由外部傳入
  const lat = parseFloat(box.dataset.lat || "25.0375");
  const lon = parseFloat(box.dataset.lon || "121.5637");

  // Open-Meteo：現在 + 今日（含最大降雨機率）
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,precipitation,relative_humidity_2m,weather_code,wind_speed_10m`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset`
    + `&timezone=Asia%2FTaipei`;

  // 小工具：安全寫入（元素不存在就略過）
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  // 天氣代碼 → 圖示與描述
  const codeMap = (code, isNight) => {
    const sun="☀️", moon="🌙", cloud="☁️", pcloud="⛅", rain="🌧️", lrain="🌦️",
          tstorm="⛈️", snow="❄️", fog="🌫️";
    const txt = {0:"晴朗",1:"多雲時晴",2:"多雲",3:"陰",45:"霧",48:"霧凇",
      51:"毛毛雨",53:"小雨",55:"中雨",56:"凍雨(毛毛雨)",57:"凍雨",
      61:"小雨",63:"中雨",65:"大雨",66:"凍雨",67:"強凍雨",
      71:"小雪",73:"中雪",75:"大雪",77:"霰",80:"陣雨",81:"強陣雨",82:"暴陣雨",
      85:"陣雪",86:"強陣雪",95:"雷雨",96:"雷雨雹",99:"劇烈雷雨雹"};
    const emoji =
      code===0 ? (isNight ? moon : sun) :
      [1,2].includes(code) ? pcloud :
      code===3 ? cloud :
      [51,53,55,61,63,65,80,81,82].includes(code) ? (code===51? lrain : rain) :
      [95,96,99].includes(code) ? tstorm :
      [71,73,75,77,85,86].includes(code) ? snow :
      [45,48].includes(code) ? fog : cloud;
    return { emoji, text: txt[code] || "—" };
  };

  fetch(url).then(r=>r.json()).then(d=>{
    // 判斷白天/夜晚（給圖示用）
    const nowISO = d?.current?.time || new Date().toISOString();
    const now = new Date(nowISO);
    const sunrise = new Date(d?.daily?.sunrise?.[0] || now);
    const sunset  = new Date(d?.daily?.sunset?.[0]  || now);
    const isNight = now < sunrise || now > sunset;

    // 現在值
    const nowT  = Math.round(d?.current?.temperature_2m ?? NaN);
    const rh    = d?.current?.relative_humidity_2m ?? null;
    const wcode = d?.current?.weather_code ?? 3;

    // 今日（日資料第 1 筆）
    const maxT = Math.round(d?.daily?.temperature_2m_max?.[0] ?? NaN);
    const minT = Math.round(d?.daily?.temperature_2m_min?.[0] ?? NaN);
    const pop  = d?.daily?.precipitation_probability_max?.[0]; // 今日最高降雨機率 %

    // 寫入卡片（只會寫到存在的元素）
    if (Number.isFinite(nowT)) set('w-now', nowT);
    if (Number.isFinite(maxT)) set('w-max', maxT);
    if (Number.isFinite(minT)) set('w-min', minT);
    if (typeof pop === 'number') set('w-pop', pop);
    if (typeof rh  === 'number') set('w-rh',  rh);

    const meta  = codeMap(wcode, isNight);
    set('w-icon', meta.emoji);
    set('w-desc', meta.text);
    set('w-time', now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}));

    // 如果你未來想再顯示「降水量 / 風速」，把下列兩行所對應的元素加回 EJS 即可：
    // const precip= d?.current?.precipitation ?? null;
    // const wind  = d?.current?.wind_speed_10m ?? null;
    // if (typeof precip === 'number') set('w-precip', precip.toFixed(1));
    // if (typeof wind   === 'number') set('w-wind',   wind.toFixed(1));
  }).catch(()=>{
    box.querySelector('.weather-body').innerHTML =
      '<div style="opacity:.85">天氣資料載入失敗，稍後再試</div>';
  });
})();

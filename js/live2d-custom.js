(function () {
  // 等待外掛把 #oml2d-menus 渲染出來再 patch
  function waitFor(sel, cb, timeout = 10000) {
    const t0 = Date.now();
    (function loop() {
      const el = document.querySelector(sel);
      if (el) return cb(el);
      if (Date.now() - t0 > timeout) return; // 超時就放棄
      requestAnimationFrame(loop);
    })();
  }

  window.addEventListener('load', function () {
    // 1) 覆蓋 info 動作（把舊網址改成新站）
    try {
      if (window.OML2D && window.OML2D.MenusActions) {
        window.OML2D.MenusActions.info = () => {
          window.open('https://oml2d.hacxy.cn/', '_blank');
        };
      }
    } catch (e) {}

    // 2) 等選單出來後，直接改 info 按鈕的點擊事件（雙保險）
    waitFor('#oml2d-menus', function (menus) {
      // 預設的按鈕 id 通常為：Sleep / SwitchTexture / SwitchModel / Info
      const infoBtn =
        menus.querySelector('#Info') ||
        menus.querySelector('[data-action="info"]') ||
        menus.querySelector('.oml2d-menus-item:last-child');

      if (infoBtn) {
        infoBtn.title = '關於 OML2D（新官網）';
        infoBtn.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          window.open('https://oml2d.hacxy.cn/', '_blank');
        }, { capture: true });
      }

      // 3) 覆寫選單樣式（顏色/圓角/hover），加上 !important 提升權重
      const css = `
        /* 外層間距（每顆之間 10px） */
        #oml2d-menus .oml2d-menus-item:not(:last-child) {
          margin-bottom: 10px !important;
        }
        /* 每顆按鈕底色/邊框/文字色 */
        #oml2d-menus .oml2d-menus-item {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          background-color: rgba(101,153,179,0.25) !important; /* 霧藍青 */
          border: 1px solid #BCAD76 !important;                 /* 花冠金 */
          color: #485868 !important;                             /* 石板藍 */
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important;
          transition: all 0.25s ease !important;
        }
        /* hover 效果 */
        #oml2d-menus .oml2d-menus-item:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 0 8px #BCAD76AA !important;
          color: #BCAD76 !important;
        }
        /* 有些主題會用 CSS 變數控制按鈕文字顏色，這裡也同步覆寫 */
        #oml2d-menus {
          --btn-bg: #485868 !important; /* icon 顏色（石板藍） */
        }
      `;
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-oml2d-patch', 'menus-style');
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    });
  });
})();

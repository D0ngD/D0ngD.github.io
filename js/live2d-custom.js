(function () {
  function waitFor(sel, cb, timeout = 10000) {
    const t0 = Date.now();
    (function loop() {
      const el = document.querySelector(sel);
      if (el) return cb(el);
      if (Date.now() - t0 > timeout) return;
      requestAnimationFrame(loop);
    })();
  }

  window.addEventListener('load', function () {
    // 覆蓋 info 按鈕行為
    try {
      if (window.OML2D && window.OML2D.MenusActions) {
        window.OML2D.MenusActions.info = () => {
          window.open('https://oml2d.hacxy.cn/', '_blank');
        };
      }
    } catch (e) {}

    waitFor('#oml2d-menus', function (menus) {
      const infoBtn =
        menus.querySelector('#Info') ||
        menus.querySelector('[data-action="info"]') ||
        menus.querySelector('.oml2d-menus-item:last-child');
      if (infoBtn) {
        infoBtn.title = '關於 OML2D（新官網）';
        infoBtn.addEventListener(
          'click',
          function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            window.open('https://oml2d.hacxy.cn/', '_blank');
          },
          { capture: true }
        );
      }

      const css = `
        #oml2d-menus .oml2d-menus-item:not(:last-child) {
          margin-bottom: 10px !important;
        }
        #oml2d-menus .oml2d-menus-item {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          background-color: rgba(101,153,179,0.25) !important;
          border: 1px solid #BCAD76 !important;
          color: #485868 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important;
          transition: all 0.25s ease !important;
        }
        #oml2d-menus .oml2d-menus-item:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 0 8px #BCAD76AA !important;
          color: #BCAD76 !important;
        }
      `;
      const styleEl = document.createElement('style');
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    });

    // 等待 statusBar 出現後修改屬性與 DOM
    waitFor('#oml2d-statusBar', function (bar) {
      // 樣式修改
      Object.assign(bar.style, {
        backgroundColor: 'rgba(101,153,179,0.25)',
        color: '#485868',
        border: '1px solid #BCAD76',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
      });

      // 立即改 DOM 顯示成你想的 restMessage
      bar.innerText = '休息中';

      // 嘗試覆蓋 OML2D 實例的 statusBar 屬性
      function patchStatusBar() {
        if (
          window.__oml2d_instance__ &&
          window.__oml2d_instance__.options &&
          window.__oml2d_instance__.options.statusBar
        ) {
          const sb = window.__oml2d_instance__.options.statusBar;
          sb.restMessage = '休息中';
          sb.switchingMessage = '邀請下一位';
          sb.reloadMessage = '重新邀請中';
          sb.loadingMessage = '來到箱中的是誰';
          sb.loadSuccessMessage = '歡迎到箱中';
          sb.loadFailMessage = '箱中不開放';
          console.log('[OML2D Patch] statusBar 訊息屬性已覆蓋');
          return true;
        }
        return false;
      }

      let tries = 0;
      const interval = setInterval(() => {
        if (patchStatusBar() || tries++ > 50) clearInterval(interval);
      }, 200);
    });
  });
})();

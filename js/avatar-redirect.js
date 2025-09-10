// source/js/avatar-redirect.js
document.addEventListener('DOMContentLoaded', () => {
  // 同時抓 header 與 sidebar（再加上通用保險）
  const selectors = [
    'header .site-avatar img',
    'header .avatar img',
    'header .kira-avatar img',
    'header .site-author-image img',
    '.sidebar .site-avatar img',
    '.sidebar .avatar img',
    '.sidebar .kira-avatar img',
    '.sidebar .site-author-image img',
    '.site-avatar img',
    '.avatar img',
    '.kira-avatar img',
    '.site-author-image img',
  ].join(', ');

  const avatars = document.querySelectorAll(selectors);
  if (!avatars.length) return;

  avatars.forEach((img) => {
    const clickTarget = img.closest('a') || img;
    clickTarget.style.cursor = 'pointer';
    clickTarget.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey) return; // 允許 Ctrl/Cmd 新分頁
      e.preventDefault();
      window.location.href = '/about/';
    });
  });
});

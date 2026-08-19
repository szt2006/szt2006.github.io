// 客户端交互：KaTeX 渲染、移动端侧栏、图片灯箱、目录滚动高亮
(function () {
  // 1) KaTeX 自动渲染 $$...$$ 与 $...$
  function renderMath() {
    if (window.katex && window.renderMathInElement) {
      try {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (e) { /* 个别公式容错 */ }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderMath);
  else renderMath();

  // 2) 移动端侧栏开关（抽屉 + 半透明遮罩）
  var toggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    var closeSb = function () {
      sidebar.classList.remove('open');
      document.body.classList.remove('sb-open');
    };
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      document.body.classList.toggle('sb-open');
    });
    overlay.addEventListener('click', closeSb);
    sidebar.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeSb(); });
  }

  // 2b) 桌面端：收起 / 展开整条目录
  var sbToggle = document.getElementById('sidebarToggle');
  if (sbToggle) {
    sbToggle.addEventListener('click', function () {
      document.body.classList.toggle('sidebar-collapsed');
    });
  }

  // 2c) 音乐浮窗（右下角）
  var mdDock = document.getElementById('musicDock');
  var mdFab = document.getElementById('mdFab');
  var mdPrev = document.getElementById('mdPrev');
  var mdNext = document.getElementById('mdNext');
  var mdClose = document.getElementById('mdClose');
  var mdFrame = document.getElementById('mdFrame');
  var mdList = window.MUSIC_LIST && window.MUSIC_LIST.length ? window.MUSIC_LIST : [{ name: '', id: '110761' }];
  var mdIdx = 0;
  if (mdDock && mdFab) {
    var mdOpen = function (open) { mdDock.setAttribute('data-open', open ? 'true' : 'false'); };
    mdOpen(false);
    mdFab.addEventListener('click', function () {
      mdOpen(mdDock.getAttribute('data-open') !== 'true');
    });
    if (mdClose) mdClose.addEventListener('click', function () { mdOpen(false); });
    var mdLoad = function () {
      if (!mdFrame) return;
      var m = mdList[mdIdx % mdList.length];
      mdFrame.src = 'https://music.163.com/outchain/player?type=2&id=' + m.id + '&auto=0&height=66';
    };
    if (mdPrev) mdPrev.addEventListener('click', function () { mdIdx = (mdIdx - 1 + mdList.length) % mdList.length; mdLoad(); });
    if (mdNext) mdNext.addEventListener('click', function () { mdIdx = (mdIdx + 1) % mdList.length; mdLoad(); });
  }

  // 3) 图片灯箱
  var lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML = '<img alt="preview">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.closest('.md-body')) {
      lbImg.src = t.src; lb.style.display = 'flex';
    }
  });
  lb.addEventListener('click', function () { lb.style.display = 'none'; });

  // 4) 目录滚动高亮（scroll-spy）
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc-list a'));
  if (tocLinks.length) {
    var heads = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var onScroll = function () {
      var pos = window.scrollY + 120, cur = heads[0];
      for (var i = 0; i < heads.length; i++) { if (heads[i].offsetTop <= pos) cur = heads[i]; }
      tocLinks.forEach(function (a) { a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 5) 进入具体页面时，左侧目录自动滚动定位到当前知识点
  var activeNav = document.querySelector('.nav-page.active');
  if (activeNav && sidebar && sidebar.scrollHeight > sidebar.clientHeight
      && !document.body.classList.contains('sidebar-collapsed')) {
    requestAnimationFrame(function () {
      var sbRect = sidebar.getBoundingClientRect();
      var aRect = activeNav.getBoundingClientRect();
      var target = sidebar.scrollTop + (aRect.top - sbRect.top) - sidebar.clientHeight / 2 + activeNav.offsetHeight / 2;
      sidebar.scrollTop = Math.max(0, target);
    });
  }
})();

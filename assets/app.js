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

  // 2c) 音乐浮窗（右下角，HTML5 audio 自建播放器）
  var mdDock = document.getElementById('musicDock');
  var mdFab = document.getElementById('mdFab');
  var mdPrev = document.getElementById('mdPrev');
  var mdNext = document.getElementById('mdNext');
  var mdPlay = document.getElementById('mdPlay');
  var mdClose = document.getElementById('mdClose');
  var mdAudio = document.getElementById('mdAudio');
  var mdName = document.getElementById('mdName');
  var mdProg = document.getElementById('mdProg');
  var mdTime = document.getElementById('mdTime');
  var mdList = window.MUSIC_LIST && window.MUSIC_LIST.length ? window.MUSIC_LIST : [{ name: '', id: '1300936430' }];
  var mdIdx = 0;
  if (mdDock && mdFab) {
    var mdOpen = function (open) { mdDock.setAttribute('data-open', open ? 'true' : 'false'); };
    mdOpen(false);
    mdFab.addEventListener('click', function () {
      mdOpen(mdDock.getAttribute('data-open') !== 'true');
    });
    if (mdClose) mdClose.addEventListener('click', function () { mdOpen(false); });
    var mdFmt = function (s) {
      if (!isFinite(s)) return '0:00';
      var m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    };
    var mdLoad = function (autoplay) {
      var m = mdList[mdIdx % mdList.length];
      if (mdName) mdName.textContent = '♪ ' + m.name;
      if (mdAudio) {
        mdAudio.src = 'https://music.163.com/song/media/outer/url?id=' + m.id + '.mp3';
        if (autoplay) { var p = mdAudio.play(); if (p) p.catch(function () {}); }
      }
    };
    if (mdAudio) {
      mdAudio.addEventListener('play', function () { if (mdPlay) mdPlay.textContent = '⏸'; });
      mdAudio.addEventListener('pause', function () { if (mdPlay) mdPlay.textContent = '▶'; });
      mdAudio.addEventListener('ended', function () { mdIdx = (mdIdx + 1) % mdList.length; mdLoad(true); });
      mdAudio.addEventListener('timeupdate', function () {
        if (mdAudio.duration) {
          if (mdProg) mdProg.value = mdAudio.currentTime / mdAudio.duration * 100;
          if (mdTime) mdTime.textContent = mdFmt(mdAudio.currentTime) + ' / ' + mdFmt(mdAudio.duration);
        }
      });
    }
    if (mdPlay) mdPlay.addEventListener('click', function () {
      if (mdAudio.paused) { var p = mdAudio.play(); if (p) p.catch(function () {}); }
      else mdAudio.pause();
    });
    if (mdProg) mdProg.addEventListener('input', function () {
      if (mdAudio && mdAudio.duration) mdAudio.currentTime = mdProg.value / 100 * mdAudio.duration;
    });
    if (mdPrev) mdPrev.addEventListener('click', function () { mdIdx = (mdIdx - 1 + mdList.length) % mdList.length; mdLoad(true); });
    if (mdNext) mdNext.addEventListener('click', function () { mdIdx = (mdIdx + 1) % mdList.length; mdLoad(true); });
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

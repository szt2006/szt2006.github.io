// 中文子串搜索：加载 search.json，实时筛选并高亮
(function () {
  var qEl = document.getElementById('q');
  var resEl = document.getElementById('results');
  var INDEX = [];
  var norm = function (s) { return (s || '').toLowerCase(); };

  fetch('assets/search.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { INDEX = data; if (qEl.value) run(qEl.value); })
    .catch(function () { resEl.innerHTML = '<p style="color:var(--muted)">搜索索引加载失败。</p>'; });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function highlight(text, q) {
    var t = escapeHtml(text);
    if (!q) return t;
    var i = norm(text).indexOf(norm(q));
    if (i < 0) return t;
    var a = t.slice(0, i), b = t.slice(i, i + q.length), c = t.slice(i + q.length);
    return a + '<mark>' + b + '</mark>' + c;
  }

  function run(query) {
    var q = query.trim();
    if (!q) { resEl.innerHTML = ''; return; }
    var ql = norm(q);
    var hits = [];
    for (var i = 0; i < INDEX.length; i++) {
      var it = INDEX[i];
      var tl = norm(it.text), nl = norm(it.title);
      var score = 0;
      if (nl.indexOf(ql) >= 0) score += 100;
      var pos = tl.indexOf(ql);
      if (pos >= 0) score += 20;
      // 多次出现加权
      var cnt = 0, from = 0;
      while ((from = tl.indexOf(ql, from)) >= 0) { cnt++; from += ql.length; }
      score += Math.min(cnt, 10) * 2;
      if (score > 0) {
        var snippet = pos >= 0 ? it.text.substr(Math.max(0, pos - 30), 80) : it.text.slice(0, 80);
        hits.push({ it: it, score: score, snippet: snippet });
      }
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    if (!hits.length) { resEl.innerHTML = '<p class="r-count">未找到相关内容。</p><p class="r-empty">溶液里没有，换个关键词再溶解一次？</p>'; return; }
    resEl.innerHTML = '<p class="r-count">找到 ' + hits.length + ' 条结果</p>' +
      hits.slice(0, 60).map(function (h) {
        return '<a class="result" href="' + h.it.url + '">' +
          '<div class="r-crumb">' + escapeHtml(h.it.crumb) + '</div>' +
          '<div class="r-title">' + highlight(h.it.title, q) + '</div>' +
          '<div class="r-snippet">' + highlight(h.snippet, q) + '…</div></a>';
      }).join('');
  }

  if (qEl) {
    qEl.addEventListener('input', function () { run(qEl.value); });
    qEl.focus();
  }
})();

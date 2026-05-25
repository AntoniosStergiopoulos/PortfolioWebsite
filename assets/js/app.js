/*
 * Portfolio website for Antonios Stergiopoulos
 * Copyright © 2026 Antonios Stergiopoulos. All rights reserved.
 * See LICENSE in the project root for details.
 */

/* ════════════════════════════════════════════
   RETRO GAME CONSOLE — app.js   
   ════════════════════════════════════════════ */
(function () {
    'use strict';

    // ── Helpers ──
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

    function esc(str) {
        if (!str) return '';
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // ── State ──
    var projects = [];
    var allTags = [];
    var catFilter = '*';
    var tagFilters = {};
    var searchQ = '';
    var mediaItems = [];
    var mediaIdx = 0;
    var touchStartX = 0;
    var overlayHistoryType = null;



    // ═══════════════════════════════
    //  STARFIELD
    // ═══════════════════════════════
    function initStarfield() {
        var canvas = $('#starfield');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var stars = [];
        var count = 120;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createStars() {
            stars = [];
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.8 + 0.2,
                    speed: Math.random() * 0.3 + 0.05,
                    opacity: Math.random() * 0.6 + 0.2,
                    twinkle: Math.random() * Math.PI * 2
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var t = Date.now() * 0.001;
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.y -= s.speed;
                if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
                var flicker = Math.sin(t * 2 + s.twinkle) * 0.3 + 0.7;
                ctx.fillStyle = 'rgba(200, 200, 240,' + (s.opacity * flicker) + ')';
                ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
            }
            requestAnimationFrame(draw);
        }

        resize();
        createStars();
        draw();
        window.addEventListener('resize', function () { resize(); createStars(); });
    }

    // ═══════════════════════════════
    //  BOOT SCREEN
    // ═══════════════════════════════
    function initBoot() {
        var boot = $('#boot-screen');
        if (!boot) return;

        function completeBoot() {
            setTimeout(function () {
                boot.classList.add('done');
                // Trigger CRT turn-on animation
                var screen = $('#crt-screen');
                if (screen) screen.classList.add('crt-on');
                setTimeout(function () { boot.remove(); }, 700);
            }, 2200);
        }

        // If page already fully loaded, run immediately
        if (document.readyState === 'complete') {
            completeBoot();
        } else {
            window.addEventListener('load', completeBoot);
        }
    }

    // ═══════════════════════════════
    //  MOBILE
    // ═══════════════════════════════

    function pushOverlayHistory(type) {
        if (!window.history || overlayHistoryType) return;

        history.pushState({ portfolioOverlay: type }, '', window.location.href);
        overlayHistoryType = type;
    }

    function clearOverlayHistory(type) {
        if (!window.history || overlayHistoryType !== type) return;

        history.replaceState(null, '', window.location.href);
        overlayHistoryType = null;
    }

    function popOverlayHistory() {
        overlayHistoryType = null;
    }

    // ═══════════════════════════════
    //  NAVIGATION
    // ═══════════════════════════════
    function initNav() {
        var header = $('#game-header');
        var toggle = $('#menu-toggle');
        var links = $('#menu-links');
        var menuLinks = $$('.menu-link');

        function isMenuOpen() {
            return links && links.classList.contains('open');
        }

        function openMenu() {
            if (!links || !toggle) return;

            links.classList.add('open');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('locked', 'nav-open');

            pushOverlayHistory('menu');
        }

        function closeMenu(fromHistory) {
            if (!links || !toggle) return;

            links.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('locked', 'nav-open');

            if (!fromHistory) {
                clearOverlayHistory('menu');
            }
        }

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
                    updateActive();
                    ticking = false;
                });
                ticking = true;
            }
        });

        if (toggle) {
            toggle.addEventListener('click', function () {
                if (isMenuOpen()) {
                    closeMenu(false);
                } else {
                    openMenu();
                }
            });
        }

        menuLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                closeMenu(false);
            });
        });

        window.addEventListener('popstate', function () {
            if (isMenuOpen()) {
                closeMenu(true);
                popOverlayHistory();
            }
        });

        function updateActive() {
            var sections = $$('section[id]');
            var scrollY = window.scrollY + 120;
            var current = '';

            sections.forEach(function (sec) {
                if (sec.offsetTop <= scrollY) current = sec.id;
            });

            menuLinks.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current);
            });
        }
    }

    // ═══════════════════════════════
    //  SCROLL REVEAL
    // ═══════════════════════════════
    function initReveal() {
        var els = $$('.reveal-up');
        if (!els.length) return;
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        els.forEach(function (el) { obs.observe(el); });
    }

    // ═══════════════════════════════
    //  EXPERIENCE YEARS
    // ═══════════════════════════════
    function initExperienceYears() {
        var elements = $$('[data-experience-years]');
        if (!elements.length) return;

        elements.forEach(function (element) {
            var startDateValue = element.getAttribute('data-start-date');
            if (!startDateValue) return;

            var startDate = new Date(startDateValue + 'T00:00:00');
            if (isNaN(startDate.getTime())) return;

            var today = new Date();
            var years = today.getFullYear() - startDate.getFullYear();

            var anniversaryHasPassed =
                today.getMonth() > startDate.getMonth() ||
                (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate());

            if (!anniversaryHasPassed) {
                years--;
            }

            element.textContent = Math.max(years, 0) + '+';
        });
    }

    // ═══════════════════════════════
    //  PROJECTS
    // ═══════════════════════════════
    function initProjects() {
        fetch('assets/data/projects.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                projects = data.projects || [];
                collectTags();
                renderGrid();
                renderTechFilters();
                updateCounts();
                bindFilterEvents();
                bindSearch();
            })
            .catch(function (err) {
                console.error('Project load failed:', err);
                var g = $('#project-grid');
                if (g) g.innerHTML = '<p style="color:var(--red);font-family:var(--font-pixel);font-size:9px">Failed to load projects.</p>';
            });
    }

    function collectTags() {
        var set = {};
        projects.forEach(function (p) {
            (p.tags || []).forEach(function (t) { set[t] = true; });
        });
        allTags = Object.keys(set).sort();
    }

    function renderGrid() {
        var grid = $('#project-grid');
        if (!grid) return;
        grid.innerHTML = projects.map(function (p) {
            var cats = (p.category || '').split(/\s+/).join(' ');
            var tags = (p.tags || []).map(function (t) {
                return '<span class="game-card-tag">' + esc(t) + '</span>';
            }).join('');
            return '<article class="game-card reveal-up" ' +
                'data-id="' + esc(p.Id) + '" ' +
                'data-cat="' + esc(cats) + '" ' +
                'data-tags="' + esc((p.tags || []).join(',').toLowerCase()) + '" ' +
                'data-title="' + esc(p.titleUrl || '').toLowerCase() + '" ' +
                'data-sub="' + esc(p.subtitleUrl || '').toLowerCase() + '" ' +
                'tabindex="0" role="button" aria-label="View ' + esc(p.titleUrl) + '">' +
                '<div class="game-card-img">' +
                '<img src="' + esc(p.imageUrl) + '" alt="' + esc(p.titleUrl) + '" loading="lazy">' +
                '<div class="game-card-hover"><span class="game-card-play">▶ VIEW</span></div>' +
                '</div>' +
                '<div class="game-card-body">' +
                '<h3 class="game-card-name">' + esc(p.titleUrl) + '</h3>' +
                '<p class="game-card-sub">' + esc(p.subtitleUrl) + '</p>' +
                '<div class="game-card-tags">' + tags + '</div>' +
                '</div></article>';
        }).join('');

        $$('.game-card', grid).forEach(function (card) {
            card.addEventListener('click', function () { openModal(card.dataset.id); });
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.id); }
            });
        });

        initReveal();
    }

    function renderTechFilters() {
        var box = $('#tag-filters');
        if (!box) return;
        box.innerHTML = allTags.map(function (t) {
            return '<button class="tech-btn" data-tag="' + esc(t.toLowerCase()) + '">' + esc(t) + '</button>';
        }).join('');

        $$('.tech-btn', box).forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tag = btn.dataset.tag;
                if (tagFilters[tag]) {
                    delete tagFilters[tag];
                    btn.classList.remove('active');
                } else {
                    tagFilters[tag] = true;
                    btn.classList.add('active');
                }
                applyFilters();
            });
        });
    }

    function updateCounts() {
        $$('.cat-count').forEach(function (el) {
            var f = el.dataset.count;
            var n = f === '*' ? projects.length : projects.filter(function (p) {
                return (p.category || '').split(/\s+/).indexOf(f) !== -1;
            }).length;
            el.textContent = '(' + n + ')';
        });
    }

    function bindFilterEvents() {
        $$('.cat-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                $$('.cat-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                catFilter = btn.dataset.filter;
                applyFilters();
            });
        });

        var clear = $('#clear-filters');
        if (clear) {
            clear.addEventListener('click', function () {
                tagFilters = {};
                searchQ = '';
                var inp = $('#project-search');
                if (inp) inp.value = '';
                $$('.tech-btn').forEach(function (b) { b.classList.remove('active'); });
                applyFilters();
            });
        }
    }

    function bindSearch() {
        var inp = $('#project-search');
        if (!inp) return;
        var timer;
        inp.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                searchQ = inp.value.trim().toLowerCase();
                applyFilters();
            }, 200);
        });
    }

    function applyFilters() {
        var cards = $$('.game-card');
        var vis = 0;
        var activeTagKeys = Object.keys(tagFilters);

        cards.forEach(function (c) {
            var cats = (c.dataset.cat || '').split(/\s+/);
            var cTags = (c.dataset.tags || '').split(',');
            var title = c.dataset.title || '';
            var sub = c.dataset.sub || '';

            var mCat = catFilter === '*' || cats.indexOf(catFilter) !== -1;

            var mTag = true;
            for (var i = 0; i < activeTagKeys.length; i++) {
                if (cTags.indexOf(activeTagKeys[i]) === -1) { mTag = false; break; }
            }

            var mSearch = !searchQ ||
                title.indexOf(searchQ) !== -1 ||
                sub.indexOf(searchQ) !== -1 ||
                (c.dataset.tags || '').indexOf(searchQ) !== -1;

            var show = mCat && mTag && mSearch;
            c.classList.toggle('hidden', !show);
            if (show) vis++;
        });

        updateChips();
        var info = $('#results-count');
        if (info) {
            var hasFilter = catFilter !== '*' || activeTagKeys.length > 0 || searchQ;
            info.textContent = hasFilter ? 'Showing ' + vis + ' of ' + cards.length + ' projects' : '';
        }
    }

    function updateChips() {
        var wrap = $('#active-filters');
        var list = $('#active-filter-tags');
        if (!wrap || !list) return;
        var keys = Object.keys(tagFilters);
        var any = keys.length > 0 || searchQ;
        wrap.hidden = !any;
        if (!any) return;

        var html = '';
        keys.forEach(function (t) {
            html += '<span class="active-chip">' + esc(t) + ' <i class="x" data-rm-tag="' + esc(t) + '">✕</i></span>';
        });
        if (searchQ) {
            html += '<span class="active-chip">"' + esc(searchQ) + '" <i class="x" data-rm-search>✕</i></span>';
        }
        list.innerHTML = html;

        $$('[data-rm-tag]', list).forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                var t = el.dataset.rmTag;
                delete tagFilters[t];
                var btn = $('.tech-btn[data-tag="' + t + '"]');
                if (btn) btn.classList.remove('active');
                applyFilters();
            });
        });
        $$('[data-rm-search]', list).forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                searchQ = '';
                var inp = $('#project-search');
                if (inp) inp.value = '';
                applyFilters();
            });
        });
    }

    // ═══════════════════════════════
    //  MODAL
    // ═══════════════════════════════
    function openModal(id) {
        var p = null;
        for (var i = 0; i < projects.length; i++) {
            if (projects[i].Id === id) { p = projects[i]; break; }
        }
        if (!p) return;

        var overlay = $('#modal-overlay');
        $('#modal-title').textContent = p.title || p.titleUrl;
        $('#modal-description').innerHTML = p.description || '';

        $('#modal-tags').innerHTML = (p.tags || []).map(function (t) {
            return '<span class="gm-tag">' + esc(t) + '</span>';
        }).join('');

        $('#modal-buttons').innerHTML = (p.buttons || []).map(function (b) {
            if (!b.url || !b.name) return '';
            return '<a href="' + esc(b.url) + '" target="_blank" rel="noopener" class="gm-link">' +
                esc(b.name) + ' <i class="fa fa-external-link-alt"></i></a>';
        }).join('');

        // Build media list: videos first, then images
        mediaItems = [];
        (p.videos || []).forEach(function (v) {
            if (v.url) mediaItems.push({ type: 'video', url: v.url, desc: v.description || '' });
        });
        (p.images || []).forEach(function (img) {
            if (img.url) mediaItems.push({ type: 'image', url: img.url, desc: img.description || '' });
        });

        buildThumbs();
        mediaIdx = 0;
        showMedia(0);

        overlay.hidden = false;

        requestAnimationFrame(function () {
            overlay.classList.add('open');
        });

        document.body.classList.add('locked');
        overlay.scrollTop = 0;

        pushOverlayHistory('modal');
    }

    function closeModal(fromHistory) {
        var overlay = $('#modal-overlay');
        if (!overlay || overlay.hidden) return;

        overlay.classList.remove('open');
        document.body.classList.remove('locked');

        var viewer = $('#media-viewer');
        var iframe = viewer ? $('iframe', viewer) : null;
        if (iframe) iframe.src = '';

        if (!fromHistory) {
            clearOverlayHistory('modal');
        }

        setTimeout(function () {
            overlay.hidden = true;
        }, 300);
    }

    function buildThumbs() {
        var strip = $('#media-thumbnails');
        if (!strip) return;

        if (mediaItems.length === 0) {
            strip.innerHTML = '';
            return;
        }

        strip.innerHTML = mediaItems.map(function (item, i) {
            if (item.type === 'video') {
                var vid = (item.url.split('embed/')[1] || '').split('?')[0];
                return '<button class="gm-thumb' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' +
                    '<img src="https://i.ytimg.com/vi_webp/' + vid + '/mqdefault.webp" alt="Video" loading="lazy">' +
                    '<span class="gm-thumb-play"><i class="fa-brands fa-youtube"></i></span></button>';
            }
            var thumbSrc = item.url.replace(/\.[^/.]+$/, '_mini.webp');
            return '<button class="gm-thumb' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' +
                '<img src="' + esc(thumbSrc) + '" alt="' + esc(item.desc) + '" loading="lazy"' +
                ' onerror="this.src=\'' + esc(item.url) + '\'"></button>';
        }).join('');

        $$('.gm-thumb', strip).forEach(function (th) {
            th.addEventListener('click', function () {
                showMedia(parseInt(th.dataset.i, 10));
            });
        });
    }

    function showMedia(idx) {
        var viewer = $('#media-viewer');

        if (!viewer) return;

        if (!mediaItems.length) {
            mediaIdx = 0;
            viewer.innerHTML = '<div class="gm-no-media"><i class="fa fa-film"></i><span>No media available</span></div>';

            $$('.gm-thumb').forEach(function (t) {
                t.classList.remove('active');
            });

            var emptyCounter = $('#media-counter');
            if (emptyCounter) emptyCounter.textContent = '';

            updateMediaNavigation();
            return;
        }
        if (idx < 0 || idx >= mediaItems.length) return;
        mediaIdx = idx;
        var viewer = $('#media-viewer');
        var item = mediaItems[idx];

        // Stop previous video
        var old = $('iframe', viewer);
        if (old) old.src = '';

        if (!item) {
            viewer.innerHTML = '<div class="gm-no-media"><i class="fa fa-film"></i><span>No media available</span></div>';
        } else if (item.type === 'video') {
            viewer.innerHTML = '<iframe src="' + esc(item.url) + '" ' +
                'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
                'allowfullscreen loading="lazy"></iframe>';
        } else {
            viewer.innerHTML = '<img src="' + esc(item.url) + '" alt="' + esc(item.desc) + '">';
        }

        $$('.gm-thumb').forEach(function (t, i) { t.classList.toggle('active', i === idx); });
        var active = $$('.gm-thumb')[idx];
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        var counter = $('#media-counter');
        if (counter) {
            if (mediaItems.length <= 1) {
                counter.textContent = item && item.desc ? item.desc : '';
            } else {
                var label = (idx + 1) + ' / ' + mediaItems.length;
                if (item && item.desc) label += ' — ' + item.desc;
                counter.textContent = label;
            }
        }

        updateMediaNavigation();
    }

    function updateMediaNavigation() {
        var prevBtn = $('#media-prev');
        var nextBtn = $('#media-next');

        var hasPrevious = mediaIdx > 0;
        var hasNext = mediaIdx < mediaItems.length - 1;

        if (prevBtn) prevBtn.hidden = !hasPrevious;
        if (nextBtn) nextBtn.hidden = !hasNext;
    }

    function initModal() {
        var overlay = $('#modal-overlay');
        var closeBtn = $('#modal-close');
        var prev = $('#media-prev');
        var next = $('#media-next');

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                closeModal(false);
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeModal(false);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                if (mediaIdx > 0) showMedia(mediaIdx - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                if (mediaIdx < mediaItems.length - 1) showMedia(mediaIdx + 1);
            });
        }

        // Keyboard
        document.addEventListener('keydown', function (e) {
            if (!overlay || overlay.hidden) return;
            if (e.key === 'Escape') closeModal(false);
            if (e.key === 'ArrowLeft' && mediaIdx > 0) showMedia(mediaIdx - 1);
            if (e.key === 'ArrowRight' && mediaIdx < mediaItems.length - 1) showMedia(mediaIdx + 1);
        });

        window.addEventListener('popstate', function () {
            var overlay = $('#modal-overlay');

            if (overlay && !overlay.hidden) {
                closeModal(true);
                popOverlayHistory();
            }
        });

        // Touch swipe on media viewer
        var viewer = $('#media-viewer');
        if (viewer) {
            viewer.addEventListener('touchstart', function (e) {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            viewer.addEventListener('touchend', function (e) {
                var dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 50) {
                    if (dx > 0 && mediaIdx > 0) {
                        showMedia(mediaIdx - 1);
                    } else if (dx < 0 && mediaIdx < mediaItems.length - 1) {
                        showMedia(mediaIdx + 1);
                    }
                }
            }, { passive: true });
        }
    }

    // ═══════════════════════════════
    //  YEAR
    // ═══════════════════════════════
    function initYear() {
        var el = $('#current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    // ═══════════════════════════════
    //  INIT
    // ═══════════════════════════════
    function init() {
        initStarfield();
        initBoot();
        initNav();
        initReveal();
        initExperienceYears();
        initProjects();
        initModal();
        initYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
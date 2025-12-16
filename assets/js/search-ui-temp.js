document.addEventListener("DOMContentLoaded", function () {
    // 1. Inject CSS for the Premium Search UI
    const n = document.createElement("style");
    n.innerHTML = `
        #search-modal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: rgba(0,0,0,0.85); /* Darker overlay */
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        #search-modal-content {
            background-color: #fff;
            margin: 5vh auto;
            max-width: 800px; /* Wider for premium feel */
            width: 90%;
            height: 80vh;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }

        .search-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .close-search {
            color: #888;
            font-size: 28px;
            font-weight: 300;
            cursor: pointer;
            transition: color 0.2s;
            line-height: 1;
        }
        .close-search:hover { color: #000; }

        #search-input {
            flex-grow: 1;
            padding: 12px 15px;
            font-size: 20px;
            border: none;
            outline: none;
            font-weight: 500;
            color: #333;
        }
        #search-input::placeholder { color: #aaa; }

        #search-results-container {
            flex-grow: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: #f9f9f9;
        }

        /* CARD STYLE RESULTS */
        .search-result-card {
            background: #fff;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            gap: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
        }
        .search-result-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .result-thumb {
            width: 80px;
            height: 80px;
            border-radius: 6px;
            object-fit: cover;
            background-color: #eee;
            flex-shrink: 0;
        }

        .result-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .result-category {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .result-title {
            font-size: 16px;
            font-weight: 700;
            color: #222;
            margin: 0 0 5px 0;
        }

        .result-desc {
            font-size: 13px;
            color: #666;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .result-match-reason {
            font-size: 11px;
            color: #2ecc71;
            margin-top: 5px;
            font-style: italic;
        }

        .no-results {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    `;
    document.head.appendChild(n);

    // 2. Inject HTML
    document.body.insertAdjacentHTML("beforeend", `
        <div id="search-modal">
            <div id="search-modal-content">
                <div class="search-header">
                    <i class="fa fa-search" style="font-size: 20px; color: #888;"></i>
                    <input type="text" id="search-input" placeholder="Buscar proyectos, cocinas, servicios..." autocomplete="off">
                    <span class="close-search">&times;</span>
                </div>
                <div id="search-results-container">
                    <div class="no-results">Empieza a escribir para buscar...</div>
                </div>
            </div>
        </div>
    `);

    // 3. Logic
    const modal = document.getElementById("search-modal");
    const input = document.getElementById("search-input");
    const resultsContainer = document.getElementById("search-results-container");
    const closeBtn = document.querySelector(".close-search");

    let fuse = null;
    let data = null;

    async function loadIndex() {
        if (fuse) return;
        try {
            const res = await fetch("/assets/js/search-index.json");
            data = await res.json();

            // Smatner Search Configuration
            const options = {
                includeScore: true,
                includeMatches: true,
                useExtendedSearch: true, // Allow operators like 'white kitchen' (AND)
                tokenize: true, // Tokenize the search
                matchAllTokens: true, // Must match ALL tokens (AND)
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'keywords', weight: 0.6 },
                    { name: 'category', weight: 0.4 },
                    { name: 'description', weight: 0.3 },
                    { name: 'body', weight: 0.1 } // Deep search but low weight
                ],
                threshold: 0.2, // TIGHTENED from 0.3 for precision
                ignoreLocation: true,
                minMatchCharLength: 3
            };

            fuse = new Fuse(data, options);
            console.log("Smart Search index loaded (Fuse.js)");
        } catch (err) {
            console.error("Failed to load search index", err);
            resultsContainer.innerHTML = '<div class="no-results">Error cargando el buscador.</div>';
        }
    }

    // Open Modal Handlers
    document.querySelectorAll('#searchx a, a[href*="/portafolio"] .fa-search, .search-trigger').forEach(el => {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            modal.style.display = "block";
            input.focus();
            loadIndex();
        });
    });

    // Close Handlers
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = "none";
    };

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });

    // Search Input Logic
    let timeout = null;
    input.addEventListener("input", function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = this.value;
            if (!fuse) return;

            if (query.length < 2) {
                resultsContainer.innerHTML = '<div class="no-results">Escribe un poco más...</div>';
                return;
            }

            const results = fuse.search(query);

            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="no-results">No se encontraron resultados para "' + query + '".<br><small>Intenta con otras palabras.</small></div>';
                return;
            }

            // Render Results
            let html = '';
            // Limit to top 20 results for performance
            results.slice(0, 20).forEach(res => {
                const item = res.item;

                // Debug match reason (optional visuals)
                // const score = res.score;

                html += `
                    <a href="${item.id}" class="search-result-card">
                        <img src="${item.image}" class="result-thumb" loading="lazy" alt="${item.title}" onerror="this.src='/assets/storage/2016/12/169471652699961817.webp'">
                        <div class="result-content">
                            <span class="result-category">${item.category}</span>
                            <h4 class="result-title">${item.title}</h4>
                            <p class="result-desc">${item.description}</p>
                        </div>
                    </a>
                `;
            });
            resultsContainer.innerHTML = html;

        }, 300); // Debounce 300ms
    });
});
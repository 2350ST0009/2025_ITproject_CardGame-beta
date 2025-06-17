// ページ読み込み時にヘッダーを生成
window.addEventListener('DOMContentLoaded', () => {
    loadHeader('header-container');
});

function loadHeader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    // 面倒くさくて絶対パス。
    // あとで変えろ
    container.innerHTML = `
<style>
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 20px;
                background-color: #2e7d32;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
                position: sticky;
                top: 0;
                z-index: 1000;
            }
            .header-left {
                display: flex;
                gap: 20px;
            }
            .nav-link {
                text-decoration: none;
                color: #f0f0f0;
                font-size: 1.2em;
                font-weight: bold;
                transition: color 0.3s ease;
            }
            .nav-link:hover {
                color: #c8e6c9;
            }
            .header-right {
                font-size: 0.9em;
                color: #e8f5e9;
            }
            .team-name {
                font-weight: bold;
                text-align: right;
            }
        </style>
        <header>
            <div class="header-left">
                <a href="../../index.html" class="nav-link">ホーム</a>
                <a href="../../header_objective.html" class="nav-link">目的</a>
            </div>
            <div class="header-right">
                <span class="team-name">TeamCardGame</span>
            </div>
        </header>
    `;
}

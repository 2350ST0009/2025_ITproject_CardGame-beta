// ページ読み込み時にヘッダーを生成
window.addEventListener('DOMContentLoaded', () => {
    loadHeader('header-container');
});

function loadHeader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 現在のパスを見て、ルート（トップページ）までの階層を自動判定する
    // "/games/" が含まれていれば2階層深いので "../../"、そうでなければ "./" (またはパスなし)
    const isInGamesDir = window.location.pathname.includes('/games/');
    const pathPrefix = isInGamesDir ? '../../' : './';

    // HTML生成（<style>タグは削除済み。css/style.cssのデザインが適用されます）
    container.innerHTML = `
        <header>
            <div class="header-left">
                <a href="${pathPrefix}index.html" class="nav-link">ホーム</a>
                <a href="${pathPrefix}header_objective.html" class="nav-link">目的</a>
            </div>
        </header>
    `;
}
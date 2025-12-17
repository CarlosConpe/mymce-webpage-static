// Instagram Feed Hybrid Engine
// 1. Checks for Valid Token
// 2. Fetches Data from Instagram Basic Display API
// 3. Replaces Static Fallback with Live Content

(function () {
    'use strict';

    // CONFIGURATION
    // TODO: User must provide this token from Meta Developer Portal
    const INSTAGRAM_TOKEN = '';
    const FALLBACK_ID = 'insta-feed-section';
    const LIMIT = 4;

    // INIT
    window.addEventListener('load', function () {
        if (INSTAGRAM_TOKEN && INSTAGRAM_TOKEN.length > 20) {
            initInstagramFeed();
        } else {
            console.warn('Instagram Feed: No Token provided. Showing Static Fallback (Good for SEO).');
        }
    });

    async function initInstagramFeed() {
        const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${INSTAGRAM_TOKEN}&limit=${LIMIT}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                renderCarousel(data.data);
            }
        } catch (error) {
            console.error('Instagram Fetch Failed:', error);
            // Do nothing - Static Fallback remains visible
        }
    }

    function renderCarousel(posts) {
        const container = document.getElementById(FALLBACK_ID);
        if (!container) return;

        let html = '<div class="row">';

        posts.forEach(post => {
            // Determine Image URL (Video vs Image)
            const imgUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
            const caption = post.caption ? truncateText(post.caption, 80) : '';
            const date = timeAgo(new Date(post.timestamp));

            html += `
                <div class="col">
                   <div class="insta-card">
                       <div class="insta-header">
                           <img src="/assets/storage/2023/07/logo-b25182a6ba332cf6a342eb4a73974ef2.webp" class="insta-avatar" alt="MYMCE Logo">
                           <a href="${post.permalink}" target="_blank" class="insta-user">${post.username || 'mymcecarpinteria'}</a>
                           <i class="fa fa-ellipsis-h insta-more"></i>
                       </div>
                       <div class="insta-img-wrap">
                           <img src="${imgUrl}" alt="${caption}" loading="lazy">
                       </div>
                       <div class="insta-actions">
                           <a href="${post.permalink}" target="_blank" style="color:inherit"><i class="fa fa-heart-o"></i></a>
                           <a href="${post.permalink}" target="_blank" style="color:inherit"><i class="fa fa-comment-o"></i></a>
                           <i class="fa fa-paper-plane-o"></i>
                           <i class="fa fa-bookmark-o"></i>
                       </div>
                       <div class="insta-caption">
                           <a href="${post.permalink}" target="_blank" class="insta-caption-user">${post.username || 'mymcecarpinteria'}</a>
                           ${caption}
                       </div>
                       <div class="insta-time">${date}</div>
                   </div>
               </div>
            `;
        });

        html += '</div>';

        // Swap Content
        container.innerHTML = html;
        console.log('Instagram Feed: Live content loaded.');
    }

    // Utilities
    function truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " AÑOS";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " MESES";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " DÍAS";
        return "HOY";
    }

})();

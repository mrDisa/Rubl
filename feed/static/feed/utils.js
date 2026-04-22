// Функция для получения CSRF токена
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Глобальная функция отрисовки поста
function createPostElement(post, accessToken) {
  const postDiv = document.createElement("div");
  postDiv.classList.add("post");

  const author = post.author || {};
  const authorName = author.first_name || author.username || "User";
  const dateObj = new Date(post.created_at);
  const formattedDate = dateObj.toLocaleDateString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
  });
  const mediaHtml = post.media
    ? `<img src="${post.media}" style="max-width: 100%; border-radius: 12px; margin-top: 15px; object-fit: cover;" />`
    : "";

  let currentLikes = post.likes_count || 0;
  let isLiked = post.is_liked || false;
  const csrftoken = getCookie("csrftoken");

  let commentsHtml = "";
  (post.comments || []).forEach((c) => {
    const cAuthor = c.author
      ? c.author.first_name || c.author.username
      : "User";
    commentsHtml += `<div style="margin-bottom: 5px; padding: 8px; background: #2a2a35; border-radius: 8px;"><span style="color: white; font-weight: bold;">${cAuthor}:</span> <span style="color: #ccc;">${c.text}</span></div>`;
  });

  postDiv.innerHTML = `
      <div class="post-header">
        <div class="post-user-info">
          <div class="avatar">${authorName.charAt(0).toUpperCase()}</div>
          <div class="user-details">
            <div class="user-name-row">
                <a href="/profile/${author.id}/" style="text-decoration:none; color:inherit;" class="user-name">${authorName}</a>
            </div>
            <div class="user-tag-row"><span class="user-tag">#${author.username || "user"}</span></div>
          </div>
        </div>
      </div>
      <h2 class="post-title" style="margin-top: 15px;">${post.title || ""}</h2>
      <p class="post-text">${post.content || ""}</p>
      ${mediaHtml}
      <div class="post-actions" style="display: flex; gap: 24px; margin-top: 16px; align-items: center; color: #8b8b9b;">
        <div class="action-btn like-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <svg class="like-icon" width="22" height="22" fill="${isLiked ? "#ff4d4f" : "#8b8b9b"}" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span class="likes-count" style="color: ${isLiked ? "#ff4d4f" : "#8b8b9b"}">${currentLikes}</span>
        </div>
        <div class="action-btn comment-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <svg width="22" height="22" fill="#8b8b9b" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg>
          <span>${post.comments_count || 0}</span>
        </div>
      </div>
      <div class="comment-section" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #2a2a35;">
        <div style="display: flex; gap: 10px;">
          <input type="text" class="comment-input" placeholder="Написать..." style="flex: 1; padding: 10px; border-radius: 8px; background: #1e1e24; color: white; border: 1px solid #333;">
          <button class="btn-submit-comment" style="padding: 10px 16px; border-radius: 8px; background: #fff; border: none; cursor: pointer;">OK</button>
        </div>
        <div class="comments-list" style="margin-top: 12px; font-size: 0.9em; display: flex; flex-direction: column; gap: 8px;">${commentsHtml}</div>
      </div>
      <div class="post-footer" style="margin-top: 12px; font-size: 0.8em; color: #8b8b9b; text-align: right;">${formattedDate}</div>
    `;

  // Логика лайка
  const lBtn = postDiv.querySelector(".like-btn");
  lBtn.addEventListener("click", async () => {
    isLiked = !isLiked;
    currentLikes += isLiked ? 1 : -1;
    lBtn
      .querySelector("svg")
      .setAttribute("fill", isLiked ? "#ff4d4f" : "#8b8b9b");
    lBtn.querySelector("span").textContent = currentLikes;
    lBtn.querySelector("span").style.color = isLiked ? "#ff4d4f" : "#8b8b9b";
    await fetch(`/api/v1/posts/${post.id}/like/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
      },
    });
  });

  // Логика комментариев
  const cBtn = postDiv.querySelector(".comment-btn");
  const cSec = postDiv.querySelector(".comment-section");
  cBtn.addEventListener("click", () => {
    cSec.style.display = cSec.style.display === "none" ? "block" : "none";
  });

  const subC = postDiv.querySelector(".btn-submit-comment");
  const inpC = postDiv.querySelector(".comment-input");
  subC.addEventListener("click", async () => {
    const val = inpC.value.trim();
    if (!val) return;
    const myName = document.getElementById("current-username")
      ? document.getElementById("current-username").textContent
      : "Я";
    const div = document.createElement("div");
    div.innerHTML = `<span style="color: white; font-weight: bold;">${myName}:</span> <span style="color: #ccc;">${val}</span>`;
    div.style.cssText =
      "padding: 8px; background: #2a2a35; border-radius: 8px;";
    postDiv.querySelector(".comments-list").prepend(div);
    inpC.value = "";
    await fetch("/api/v1/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ post: post.id, text: val }),
    });
  });

  return postDiv;
}

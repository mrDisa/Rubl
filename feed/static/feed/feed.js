document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/login/";
    return;
  }

  const csrftoken = getCookie("csrftoken");
  const feedContainer = document.getElementById("feed-posts-container");

  async function loadMyProfile() {
    try {
      const response = await fetch("/api/v1/users/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const userData = await response.json();
        document.getElementById("current-username").textContent =
          userData.username;
        document.getElementById("current-usertag").textContent =
          `@${userData.username}`;
        document.getElementById("current-avatar").textContent =
          userData.username.charAt(0).toUpperCase();

        const myProfileLink = document.getElementById("my-profile-link");
        if (myProfileLink) {
          myProfileLink.href = `/profile/${userData.id}/`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPosts() {
    try {
      const res = await fetch("/api/v1/posts/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const posts = await res.json();
      const results = posts.results || posts;

      results.forEach((post) => {
        feedContainer.appendChild(createPostElement(post, accessToken));
      });
    } catch (e) {
      console.error(e);
    }
  }

  // === ЖИВОЙ ПОИСК ===
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  let searchTimeout = null;

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (searchTimeout) clearTimeout(searchTimeout);

      if (!query) {
        searchResults.style.display = "none";
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/v1/search/?q=${encodeURIComponent(query)}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            renderSearchResults(data);
          }
        } catch (err) {
          console.error("Ошибка поиска", err);
        }
      }, 300);
    });

    function renderSearchResults(data) {
      searchResults.innerHTML = "";
      const { users, posts } = data;

      if (users.length === 0 && posts.length === 0) {
        searchResults.innerHTML =
          '<div style="padding: 16px; color: #8b8b9b; text-align: center; font-size: 14px;">Ничего не найдено 😔</div>';
        searchResults.style.display = "block";
        return;
      }

      let html = "";
      if (users.length > 0) {
        html +=
          '<div style="padding: 12px 16px 8px; font-size: 12px; font-weight: 700; color: #8b8b9b; text-transform: uppercase; letter-spacing: 1px;">Пользователи</div>';
        users.forEach((user) => {
          const name = user.first_name || user.username;
          const initial = name.charAt(0).toUpperCase();
          html += `
            <a href="/profile/${user.id}/" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; text-decoration: none; color: inherit; transition: 0.2s;" onmouseover="this.style.background='#2a2a35'" onmouseout="this.style.background='transparent'">
              <div style="width: 36px; height: 36px; background: #ffffff; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">${initial}</div>
              <div style="display: flex; flex-direction: column;">
                <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${name}</span>
                <span style="color: #8b8b9b; font-size: 13px;">@${user.username}</span>
              </div>
            </a>`;
        });
      }

      if (posts.length > 0) {
        html +=
          '<div style="padding: 12px 16px 8px; font-size: 12px; font-weight: 700; color: #8b8b9b; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #2a2a35; margin-top: 4px;">Посты</div>';
        posts.forEach((post) => {
          html += `
            <a href="/profile/${post.author.id}/" style="display: block; padding: 12px 16px; text-decoration: none; color: inherit; transition: 0.2s;" onmouseover="this.style.background='#2a2a35'" onmouseout="this.style.background='transparent'">
              <div style="color: #ffffff; font-weight: 600; font-size: 14px; margin-bottom: 4px;">${post.title || "Без заголовка"}</div>
              <div style="color: #8b8b9b; font-size: 13px;">Автор: @${post.author.username}</div>
            </a>`;
        });
      }
      searchResults.innerHTML = html;
      searchResults.style.display = "block";
    }

    document.addEventListener("click", (e) => {
      if (!document.getElementById("search-container").contains(e.target)) {
        searchResults.style.display = "none";
      }
    });
  }

  // === ОСТАЛЬНАЯ ЛОГИКА (ПОСТЫ) ===
  const sBtn = document.getElementById("submit-post-btn");
  const mediaInp = document.getElementById("new-post-media");
  const attachBtn = document.getElementById("attach-media-btn");
  const fileName = document.getElementById("attached-file-name");

  if (attachBtn) {
    attachBtn.addEventListener("click", () => mediaInp.click());
    mediaInp.addEventListener("change", () => {
      if (mediaInp.files[0]) {
        fileName.textContent = mediaInp.files[0].name;
        attachBtn.setAttribute("fill", "#fff");
      }
    });
  }

  sBtn.addEventListener("click", async () => {
    const title = document.getElementById("new-post-title").value.trim();
    const content = document.getElementById("new-post-content").value.trim();
    if (!content) return;

    const fd = new FormData();
    if (title) fd.append("title", title);
    fd.append("content", content);
    if (mediaInp.files[0]) fd.append("media", mediaInp.files[0]);

    try {
      const res = await fetch("/api/v1/posts/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-CSRFToken": csrftoken,
        },
        body: fd,
      });
      if (res.ok) {
        const newPost = await res.json();
        feedContainer.prepend(createPostElement(newPost, accessToken));
        document.getElementById("new-post-title").value = "";
        document.getElementById("new-post-content").value = "";
        mediaInp.value = "";
        fileName.textContent = "";
      }
    } catch (e) {
      console.error(e);
    }
  });

  loadMyProfile();
  fetchPosts();
  if (typeof initNotifications === "function") initNotifications(accessToken);
});

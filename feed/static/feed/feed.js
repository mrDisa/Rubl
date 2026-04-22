document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/login/";
    return;
  }

  const csrftoken = getCookie("csrftoken");
  const feedContainer = document.querySelector(".feed");
  const feedEnd = document.querySelector(".feed-end");

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
          `#${userData.username}`;
        document.getElementById("current-avatar").textContent =
          userData.username.charAt(0).toUpperCase();

        // Оживляем ссылку в сайдбаре!
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
        feedContainer.insertBefore(
          createPostElement(post, accessToken),
          feedEnd,
        );
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Логика кнопки "Запостить"
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
    if (!title || !content) return alert("Заполните заголовок и текст!");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    if (mediaInp.files[0]) fd.append("media", mediaInp.files[0]);

    sBtn.disabled = true;
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
        feedContainer.insertBefore(
          createPostElement(newPost, accessToken),
          feedContainer.querySelector(".post") || feedEnd,
        );
        document.getElementById("new-post-title").value = "";
        document.getElementById("new-post-content").value = "";
        mediaInp.value = "";
        fileName.textContent = "";
        attachBtn.setAttribute("fill", "#8b8b9b");
      }
    } catch (e) {
      console.error(e);
    }
    sBtn.disabled = false;
  });

  loadMyProfile();
  fetchPosts();
});

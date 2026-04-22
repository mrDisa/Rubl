document.addEventListener("DOMContentLoaded", async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/login/";
    return;
  }

  // Получаем ID из URL (/profile/5/ -> 5)
  const urlParts = window.location.pathname.split("/").filter((p) => p !== "");
  const userIdFromUrl = urlParts[urlParts.length - 1];

  const editBtn = document.getElementById("edit-profile-btn");
  const editModal = document.getElementById("edit-modal");

  async function initProfile() {
    try {
      // 1. Загружаем "Меня" для сайдбара и проверки прав
      const meRes = await fetch("/api/v1/users/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = await meRes.json();

      // Синхронизируем сайдбар
      document.getElementById("current-username").textContent = me.username;
      document.getElementById("current-usertag").textContent =
        `#${me.username}`;
      document.getElementById("current-avatar").textContent = me.username
        .charAt(0)
        .toUpperCase();
      document.getElementById("my-profile-link").href = `/profile/${me.id}/`;

      // 2. Загружаем данные текущего профиля
      const res = await fetch(`/api/v1/users/${userIdFromUrl}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await res.json();

      // Заполняем шапку профиля
      document.getElementById("profile-name").textContent =
        user.first_name || user.username;
      document.getElementById("profile-job").textContent =
        user.job || "Должность не указана";
      document.getElementById("profile-bio").textContent =
        user.bio || "О себе пока ничего нет...";

      const avatarBig = document.getElementById("profile-avatar-big");
      if (user.avatar) {
        avatarBig.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover;">`;
      } else {
        avatarBig.textContent = user.username.charAt(0).toUpperCase();
      }

      // 3. Если это мой профиль — показываем кнопку
      if (String(me.id) === String(user.id)) {
        editBtn.style.display = "inline-block";
      }

      // 4. Грузим посты
      loadUserPosts(user.id);
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
  }

  async function loadUserPosts(uid) {
    const container = document.getElementById("user-posts-container");
    const end = document.getElementById("profile-feed-end");
    try {
      const res = await fetch(`/api/v1/posts/user/${uid}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      const posts = data.results || data;

      document.getElementById("posts-count").textContent = posts.length;
      container.innerHTML = "";

      if (posts.length === 0) {
        end.textContent = "Публикаций пока нет.";
        return;
      }

      posts.forEach((post) => {
        container.appendChild(createPostElement(post, accessToken));
      });
      end.textContent = "Все публикации загружены.";
    } catch (e) {
      end.textContent = "Ошибка при загрузке постов.";
    }
  }

  // Логика модалки
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      editModal.style.display = "flex";
      // Подтягиваем текущие значения в инпуты
      document.getElementById("edit-firstname").value =
        document.getElementById("profile-name").textContent;
      document.getElementById("edit-job").value =
        document.getElementById("profile-job").textContent ===
        "Должность не указана"
          ? ""
          : document.getElementById("profile-job").textContent;
      document.getElementById("edit-bio").value =
        document.getElementById("profile-bio").textContent ===
        "О себе пока ничего нет..."
          ? ""
          : document.getElementById("profile-bio").textContent;
    });
  }

  document
    .getElementById("close-modal")
    .addEventListener("click", () => (editModal.style.display = "none"));

  document
    .getElementById("edit-profile-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append("first_name", document.getElementById("edit-firstname").value);
      fd.append("bio", document.getElementById("edit-bio").value);
      fd.append("job", document.getElementById("edit-job").value);

      const avatarFile = document.getElementById("edit-avatar-input").files[0];
      if (avatarFile) fd.append("avatar", avatarFile);

      await fetch(`/api/v1/users/${userIdFromUrl}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: fd,
      });
      location.reload();
    });

  initProfile();
});

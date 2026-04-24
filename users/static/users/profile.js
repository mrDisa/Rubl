document.addEventListener("DOMContentLoaded", async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/login/";
    return;
  }

  const urlParts = window.location.pathname.split("/").filter((p) => p !== "");
  const userIdFromUrl = urlParts[urlParts.length - 1];

  const editBtn = document.getElementById("edit-profile-btn");
  const followBtn = document.getElementById("follow-btn");
  const editModal = document.getElementById("edit-modal");

  async function initProfile() {
    try {
      const meRes = await fetch("/api/v1/users/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = await meRes.json();

      document.getElementById("current-username").textContent = me.username;
      document.getElementById("current-usertag").textContent =
        `@${me.username}`;
      document.getElementById("current-avatar").textContent = me.username
        .charAt(0)
        .toUpperCase();
      document.getElementById("my-profile-link").href = `/profile/${me.id}/`;

      const res = await fetch(`/api/v1/users/${userIdFromUrl}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await res.json();

      document.getElementById("profile-name").textContent =
        user.first_name || user.username;
      document.getElementById("profile-job").textContent =
        user.job || "Должность не указана";
      document.getElementById("profile-bio").textContent =
        user.bio || "О себе пока ничего нет...";
      document.getElementById("followers-count").textContent =
        user.followers_count || 0;

      const avatarBig = document.getElementById("profile-avatar-big");
      if (user.avatar) {
        avatarBig.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover;">`;
      } else {
        avatarBig.textContent = user.username.charAt(0).toUpperCase();
      }

      if (String(me.id) === String(user.id)) {
        editBtn.style.display = "block";
      } else {
        followBtn.style.display = "block";
        let isFollowing = user.is_followed || false;

        const updateFollowUI = () => {
          followBtn.textContent = isFollowing ? "Отписаться" : "Подписаться";
          followBtn.style.background = isFollowing ? "transparent" : "#ffffff";
          followBtn.style.color = isFollowing ? "#ffffff" : "#000000";
          followBtn.style.border = isFollowing ? "1px solid #333333" : "none";
        };
        updateFollowUI();

        followBtn.addEventListener("click", async () => {
          try {
            let followRes;

            if (isFollowing) {
              followRes = await fetch(
                `/api/v1/interactions/${userIdFromUrl}/`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "X-CSRFToken": getCookie("csrftoken"),
                  },
                },
              );
            } else {
              followRes = await fetch(`/api/v1/interactions/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                  "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({ following: userIdFromUrl }),
              });
            }

            if (followRes.ok) {
              isFollowing = !isFollowing;
              updateFollowUI();

              const currentFollowers = parseInt(
                document.getElementById("followers-count").textContent,
              );
              document.getElementById("followers-count").textContent =
                isFollowing ? currentFollowers + 1 : currentFollowers - 1;
            } else {
              const errorText = await followRes.text();
              console.error("Бэкенд ругается:", errorText);
            }
          } catch (e) {
            console.error("Ошибка при подписке:", e);
          }
        });
      }

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

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      editModal.style.display = "flex";
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

  const closeEditModal = document.getElementById("close-modal");
  if (closeEditModal) {
    closeEditModal.addEventListener(
      "click",
      () => (editModal.style.display = "none"),
    );
  }

  const editProfileForm = document.getElementById("edit-profile-form");
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (e) => {
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
  }

  initProfile();

  if (typeof initNotifications === "function") {
    initNotifications(accessToken);
  }
});

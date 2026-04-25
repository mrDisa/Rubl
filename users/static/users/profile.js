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

  let nextUserPostsUrl = null;
  let isFetchingUserPosts = false;

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
      document.getElementById("dropdown-profile-link").href =
        `/profile/${me.id}/`;

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

      document.getElementById("posts-count").textContent =
        data.count !== undefined ? data.count : posts.length;
      container.innerHTML = "";

      if (posts.length === 0) {
        end.textContent = "Публикаций пока нет.";
        end.style.display = "block";
        return;
      }

      posts.forEach((post) => {
        container.appendChild(createPostElement(post, accessToken));
      });

      nextUserPostsUrl = data.next || null;
      if (!nextUserPostsUrl) {
        end.textContent = "Все публикации загружены.";
        end.style.display = "block";
      } else {
        end.style.display = "none";
      }
    } catch (e) {
      end.textContent = "Ошибка при загрузке постов.";
      end.style.display = "block";
    }
  }

  async function fetchMoreUserPosts() {
    if (!nextUserPostsUrl || isFetchingUserPosts) return;

    isFetchingUserPosts = true;
    const container = document.getElementById("user-posts-container");
    const end = document.getElementById("profile-feed-end");

    end.style.display = "block";
    end.textContent = "Загрузка...";

    try {
      const res = await fetch(nextUserPostsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const posts = data.results || data;

        posts.forEach((post) => {
          container.appendChild(createPostElement(post, accessToken));
        });

        nextUserPostsUrl = data.next || null;

        if (!nextUserPostsUrl) {
          end.textContent = "Все публикации загружены.";
        } else {
          end.style.display = "none";
        }
      }
    } catch (e) {
      console.error("Ошибка при подгрузке постов:", e);
    }
    isFetchingUserPosts = false;
  }

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 500
    ) {
      fetchMoreUserPosts();
    }
  });

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

  // === ЛОГИКА МОДАЛКИ ПОДПИСЧИКОВ ===
  const followersBtn = document.getElementById("followers-btn");
  const followersModal = document.getElementById("followers-modal");
  const closeFollowersBtn = document.getElementById("close-followers");
  const followersList = document.getElementById("followers-list");

  if (followersBtn && followersModal) {
    followersBtn.addEventListener("click", async () => {
      followersModal.style.display = "flex";
      followersList.innerHTML =
        '<div style="color:#8b8b9b; text-align:center; padding:20px;">Загрузка...</div>';

      try {
        // Запрос к API (Бэкендеру нужно будет сделать этот эндпоинт!)
        const res = await fetch(`/api/v1/users/${userIdFromUrl}/followers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          const followers = data.results || data;

          followersList.innerHTML = "";
          if (followers.length === 0) {
            followersList.innerHTML =
              '<div style="color:#8b8b9b; text-align:center; padding:20px;">Пока нет подписчиков</div>';
            return;
          }

          followers.forEach((u) => {
            // Поддержка разных форматов ответа бэкенда
            const userObj = u.follower ? u.follower : u;

            const initial = userObj.username
              ? userObj.username.charAt(0).toUpperCase()
              : "?";
            const name = userObj.first_name || userObj.username;

            const avatarHtml = userObj.avatar
              ? `<img src="${userObj.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
              : initial;

            const div = document.createElement("a");
            div.href = `/profile/${userObj.id}/`;
            div.style.cssText =
              "display:flex; align-items:center; gap:12px; padding:10px 14px; text-decoration:none; color:inherit; border-radius:16px; transition:0.2s;";
            div.onmouseover = () => (div.style.background = "#2a2a35");
            div.onmouseout = () => (div.style.background = "transparent");

            div.innerHTML = `
              <div style="width: 44px; height: 44px; background: #ffffff; color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; overflow: hidden;">
                ${avatarHtml}
              </div>
              <div style="display: flex; flex-direction: column;">
                <div style="color: #ffffff; font-weight: 600; font-size: 15px;">${name}</div>
                <div style="color: #8b8b9b; font-size: 13px;">@${userObj.username}</div>
              </div>
            `;
            followersList.appendChild(div);
          });
        } else {
          followersList.innerHTML =
            '<div style="color:#ff4d4f; text-align:center; padding:20px;">Ошибка загрузки (нужен эндпоинт от бэкенда)</div>';
        }
      } catch (e) {
        console.error(e);
        followersList.innerHTML =
          '<div style="color:#ff4d4f; text-align:center; padding:20px;">Ошибка сети</div>';
      }
    });

    closeFollowersBtn.addEventListener(
      "click",
      () => (followersModal.style.display = "none"),
    );
    followersModal.addEventListener("click", (e) => {
      if (e.target === followersModal) followersModal.style.display = "none";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && followersModal.style.display === "flex")
        followersModal.style.display = "none";
    });
  }

  initProfile();

  if (typeof initNotifications === "function") initNotifications(accessToken);
  if (typeof initUserMenu === "function") initUserMenu();
});

const sections = [...document.querySelectorAll(".section")];
const navLinks = [...document.querySelectorAll(".nav-links a")];
const chipButtons = [...document.querySelectorAll(".chip")];
const searchInput = document.getElementById("searchInput");
const projectGrid = document.getElementById("projectGrid");
const skeletonGrid = document.getElementById("skeletonGrid");
const topicTitle = document.getElementById("topicTitle");
const topicIntro = document.getElementById("topicIntro");
const topicBody = document.getElementById("topicBody");
const topicUseCase = document.getElementById("topicUseCase");
const projectModal = document.getElementById("projectModal");
const projectModalClose = document.getElementById("projectModalClose");
const projectModalTitle = document.getElementById("projectModalTitle");
const projectModalTag = document.getElementById("projectModalTag");
const projectModalSummary = document.getElementById("projectModalSummary");
const projectModalContent = document.getElementById("projectModalContent");
const toastStack = document.getElementById("toastStack");
const menuToggleButton = document.querySelector(".menu-toggle");
const navWrap = document.querySelector(".nav-links");
const authNavLink = document.getElementById("authNavLink");
const logoutNavBtn = document.getElementById("logoutNavBtn");
const dashboardNavLink = document.getElementById("dashboardNavLink");

function getApiBaseUrl() {
  // If running locally, use localhost. 
  // Otherwise, use your Render Backend URL.
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isLocal ? "http://localhost:5000" : "https://gyaanuday-1.onrender.com"; 
}

let projects = []; // Initialize empty, will fetch from API

let activeFilter = "all";
const topicDescriptions = {
  all: {
    title: "All Projects",
    intro:
      "This view gives you a broad discovery feed across AI, web, IoT, analytics, and multidisciplinary innovations so you can compare ideas quickly without narrowing too early.",
    body:
      "Use this section to identify patterns across teams: problem statements, implementation quality, user focus, and measurable outcomes. It is especially useful during early research when you want to scan multiple approaches before deciding where to invest your time.",
    useCase:
      "Best for first-time exploration, hackathon inspiration, and finding cross-domain concepts that can be merged into stronger projects.",
  },
  ai: {
    title: "Artificial Intelligence",
    intro:
      "AI projects in this section focus on machine learning, NLP, computer vision, and predictive systems that learn from data and improve decision-making.",
    body:
      "Typical submissions include resume ranking engines, recommendation pipelines, image classifiers, and smart assistants. A strong AI project clearly explains data sources, model architecture, training strategy, evaluation metrics, and how the model performs in real-world conditions.",
    useCase:
      "Use this category when you are looking for automated intelligence, advanced analytics, and systems that reduce manual effort through learning-based behavior.",
  },
  web: {
    title: "Web Development",
    intro:
      "Web projects highlight modern frontend and backend engineering for interactive platforms, dashboards, and collaboration experiences.",
    body:
      "High-quality web entries usually demonstrate responsive design, API integration, clean state management, accessibility, and security practices. You can evaluate architecture choices such as component structure, routing strategy, performance optimization, and scalability of the overall application.",
    useCase:
      "Use this category when you want deployable products for browsers, user portals, admin systems, and teamwork-focused digital tools.",
  },
  iot: {
    title: "Internet of Things",
    intro:
      "IoT projects combine hardware devices, sensors, network communication, and software dashboards to monitor and control physical systems.",
    body:
      "Common examples include smart irrigation, energy monitoring, environmental sensing, and automated campus solutions. The strongest IoT implementations provide stable sensor calibration, low-latency data flow, reliable alerts, and practical deployment details such as power usage, connectivity, and maintenance strategy.",
    useCase:
      "Use this category when your goal is real-world automation, remote control, and data-driven operations for physical infrastructure.",
  },
  popular: {
    title: "Popularity and Community Impact",
    intro:
      "This view surfaces projects that are attracting strong community attention through higher likes, views, and engagement behavior.",
    body:
      "Popularity often indicates clear communication, practical relevance, and polished execution. Reviewing these projects helps you understand what resonates with users: strong demos, concise problem framing, visible outcomes, and thoughtful documentation that makes ideas easy to adopt and extend.",
    useCase:
      "Use this category to benchmark project presentation quality, identify trending themes, and model your own submission for higher visibility.",
  },
};



function openProjectModal(project) {
  if (!projectModal || !projectModalTitle || !projectModalSummary || !projectModalContent || !projectModalTag) {
    return;
  }

  // Use real user input from the project object
  projectModalTag.textContent = project.domain || "General";
  projectModalTitle.textContent = project.title;
  projectModalSummary.textContent = (project.tags || []).join(" • ");
  
  // Format description into paragraphs
  const descriptionHtml = (project.description || "No description provided.")
    .split("\n")
    .filter(p => p.trim())
    .map(p => `<p>${p}</p>`)
    .join("");
    
  projectModalContent.innerHTML = descriptionHtml;
  
  const downloadBtn = document.getElementById("projectModalDownload");
  if (downloadBtn) {
    if (project.fileUrl) {
      downloadBtn.href = `${getApiBaseUrl()}${project.fileUrl}`;
      downloadBtn.style.display = "inline-flex";
    } else {
      downloadBtn.style.display = "none";
    }
  }

  projectModal.classList.remove("hidden");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.add("hidden");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function updateTopicDetails(filterKey) {
  const details = topicDescriptions[filterKey] || topicDescriptions.all;
  if (!topicTitle || !topicIntro || !topicBody || !topicUseCase) return;
  topicTitle.textContent = details.title;
  topicIntro.textContent = details.intro;
  topicBody.textContent = details.body;
  topicUseCase.textContent = details.useCase;
}

function redirectToDashboard() {
  const user = getCurrentUser();
  if (!user) {
    notify("Please login to access your dashboard.");
    window.location.hash = "#auth";
    return;
  }
  if (user.role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "user-dashboard.html";
  }
}

function showSectionByHash() {
  const hash = window.location.hash || "#landing";
  const requestedId = hash.replace("#", "");

  if (requestedId === "dashboard") {
    redirectToDashboard();
    return;
  }

  // Handle redirects if on index.html and trying to reach auth/upload
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
    if (requestedId === "auth") {
      window.location.href = "auth.html";
      return;
    }
    if (requestedId === "upload") {
      redirectToDashboard(); // In the new flow, upload is inside the dashboard
      return;
    }
  }

  const targetSection = document.getElementById(requestedId);
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: "smooth" });
  }

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${requestedId}`);
  });

  if (navWrap) navWrap.classList.remove("open");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function renderProjects(list) {
  if (!projectGrid) return;
  projectGrid.innerHTML = "";

  if (!list.length) {
    projectGrid.innerHTML =
      '<article class="project-card"><h3>No projects found</h3><p>Try another keyword or filter.</p></article>';
    return;
  }

  list.forEach((project) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card project-card-button";
    card.setAttribute("aria-label", `Open details for ${project.title}`);
    card.innerHTML = `
      <h3>${project.title}</h3>
      <div class="tags">${project.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      <p>${project.preview}</p>
    `;
    card.addEventListener("click", () => {
      openProjectModal(project);
    });
    projectGrid.appendChild(card);
  });
}

function applyProjectFilters() {
  if (!searchInput) return;
  const query = searchInput.value.toLowerCase().trim();
  const filtered = projects.filter((project) => {
    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "popular"
          ? project.tags.includes("popular") || project.likes > 1500
          : project.tags.includes(activeFilter);

    const haystack = `${project.title} ${project.preview} ${project.tags.join(" ")}`.toLowerCase();
    return matchesFilter && haystack.includes(query);
  });

  renderProjects(filtered);
}

function notify(message) {
  if (!toastStack) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastStack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function updateAuthNavUI() {
  if (!authNavLink || !logoutNavBtn) return;
  const storedUser = localStorage.getItem("authUser");
  if (!storedUser) {
    authNavLink.textContent = "Login";
    authNavLink.setAttribute("href", "auth.html");
    logoutNavBtn.classList.add("hidden");
    return;
  }
  try {
    const user = JSON.parse(storedUser);
    const displayName = user?.name?.trim() || "User";
    authNavLink.textContent = displayName;
    authNavLink.setAttribute("href", "#");
    authNavLink.onclick = (e) => {
      e.preventDefault();
      redirectToDashboard();
    };
    logoutNavBtn.classList.remove("hidden");
  } catch (error) {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    authNavLink.textContent = "Login";
    authNavLink.setAttribute("href", "auth.html");
    logoutNavBtn.classList.add("hidden");
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch (error) {
    return null;
  }
}

function requireAuth(message = "Please login to continue.") {
  const user = getCurrentUser();
  if (user) return user;
  notify(message);
  window.location.href = "auth.html";
  return null;
}

function setAuthSession(user, token) {
  if (!user) return;
  const resolvedToken = token || `local-${Date.now()}`;
  localStorage.setItem("authToken", resolvedToken);
  localStorage.setItem("authUser", JSON.stringify(user));
}

async function setupExplore() {
  if (!skeletonGrid || !projectGrid) return;
  
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/projects?limit=50`);
    const result = await res.json();
    if (result.success) {
      projects = result.data.items;
    }
  } catch (error) {
    console.error("Failed to fetch explore projects", error);
  }

  setTimeout(() => {
    skeletonGrid.classList.add("hidden");
    projectGrid.classList.remove("hidden");
    renderProjects(projects);
  }, 1200);

  updateTopicDetails(activeFilter);

  chipButtons.forEach((chip) => {
    chip.addEventListener("click", () => {
      chipButtons.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      updateTopicDetails(activeFilter);
      applyProjectFilters();
    });
  });

  searchInput.addEventListener("input", applyProjectFilters);

  if (projectModalClose) {
    projectModalClose.addEventListener("click", closeProjectModal);
  }
  if (projectModal) {
    projectModal.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
        closeProjectModal();
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProjectModal();
  });
}

function setupUploadForm() {
  const form = document.getElementById("uploadForm");
  if (!form) return;
  const submitBtn = document.getElementById("submitBtn");
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  if (!submitBtn || !dropZone || !fileInput || !fileList) return;

  dropZone.addEventListener("click", () => fileInput.click());
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("dragover");
    });
  });
  dropZone.addEventListener("drop", (event) => {
    const files = [...event.dataTransfer.files];
    fileList.textContent = files.map((file) => file.name).join(", ");
  });
  fileInput.addEventListener("change", () => {
    const files = [...fileInput.files];
    fileList.textContent = files.map((file) => file.name).join(", ");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = requireAuth("Please login before uploading a project.");
    if (!user) return;

    // Simple validation
    const title = document.getElementById("projectTitle").value.trim();
    const domain = document.getElementById("projectDomain").value.trim();
    const description = document.getElementById("projectDescription").value.trim();

    if (!title || !domain || !description) {
      notify("Please fill in Title, Domain, and Description.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("domain", domain);
    formData.append("description", description);
    const tagsInput = document.getElementById("projectTags");
    const tagsStr = tagsInput ? tagsInput.value : "";
    if (tagsStr) {
      tagsStr.split(",").forEach(tag => {
        const t = tag.trim();
        if (t) formData.append("tags", t);
      });
    }

    const githubInput = document.getElementById("projectGithub");
    const deployInput = document.getElementById("projectDeploy");
    if (githubInput) formData.append("githubLink", githubInput.value.trim());
    if (deployInput) formData.append("deployLink", deployInput.value.trim());

    const files = fileInput.files;
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    const submitOriginalLabel = submitBtn.textContent;
    submitBtn.textContent = "Uploading...";
    submitBtn.disabled = true;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${getApiBaseUrl()}/api/projects`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        notify(result.message || "Upload failed.");
        return;
      }

      notify("Project uploaded successfully.");
      form.reset();
      fileList.textContent = "";

      renderDashboardData();
      const projectsLink = document.querySelector('[data-panel="userProjects"]');
      if (projectsLink) projectsLink.click();
      else redirectToDashboard();
    } catch (error) {
      notify("Upload failed: " + (error.message || "Network error. Please try a smaller file."));
    } finally {
      submitBtn.textContent = submitOriginalLabel;
      submitBtn.disabled = false;
    }
  });
}

function renderDashboardData() {
  const user = getCurrentUser();
  if (!user) return;

  const adminPanel = document.getElementById("dashPanelAdmin");
  const userPanel = document.getElementById("dashPanelUser");

  if (user.role === "admin") {
    if (adminPanel) loadAdminDashboardData();
  } else {
    if (userPanel) loadUserDashboardData(user);
  }
}

async function loadAdminDashboardData() {
  const user = getCurrentUser();
  const token = localStorage.getItem("authToken");
  const list = document.getElementById("adminUserList");

  try {
    const [usersRes, projRes] = await Promise.all([
      fetch(`${getApiBaseUrl()}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${getApiBaseUrl()}/api/projects?limit=1`)
    ]);
    
    const usersResult = await usersRes.json();
    if (!usersRes.ok || !usersResult.success) {
      if (list) list.innerHTML = `<li style="list-style:none; color:var(--text-secondary);">Error loading users: ${usersResult.message || 'Unauthorized'}</li>`;
      return;
    }
    const users = usersResult.data || [];
    const projResult = await projRes.json();

    const totalUsersEl = document.getElementById("adminTotalUsers");
    const totalProjectsEl = document.getElementById("adminTotalProjects");
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalProjectsEl) totalProjectsEl.textContent = projResult.data?.pagination?.total || 0;

    if (!list) return;
    if (!users.length) {
      list.innerHTML = "<li>No users found.</li>";
      return;
    }
    list.innerHTML = "";
    users.forEach((u) => {
      const isCurrentUser = u._id === user._id || u.id === user.id;
      const isAdmin = u.role === "admin";

      const li = document.createElement("li");
      li.className = "user-list-item glass reveal visible";
      li.style.padding = "1.25rem 1.5rem";
      li.style.borderRadius = "15px";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.listStyle = "none";
      li.style.border = "1px solid rgba(255,255,255,0.05)";
      li.style.transition = "all 0.3s ease";

      li.innerHTML = `
        <div class="user-info" style="display: flex; align-items: center; gap: 1rem;">
          <div class="user-avatar" style="width: 45px; height: 45px; background: ${isAdmin ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            ${isAdmin ? '👑' : '👤'}
          </div>
          <div>
            <p style="margin:0; font-weight:700; color:#fff; font-size: 1.05rem;">
              ${u.name} ${isCurrentUser ? '<span class="badge" style="background:rgba(99,102,241,0.2); color:#a5b4fc; margin-left:8px; font-size:0.7rem;">You</span>' : ''}
            </p>
            <p style="margin:4px 0 0; font-size:0.85rem; color:var(--text-secondary);">${u.email} • <span style="text-transform: capitalize; color: ${isAdmin ? '#a5b4fc' : 'inherit'}">${u.role}</span></p>
          </div>
        </div>
        <div class="user-actions">
          ${(isAdmin) ? '' : `
            <button class="btn btn-danger delete-user-btn" 
                    style="padding: 8px 16px; font-size: 0.8rem; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px;" 
                    data-id="${u._id || u.id}">Delete User</button>
          `}
        </div>
      `;
      list.appendChild(li);
    });
    list.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
          const delRes = await fetch(`${getApiBaseUrl()}/api/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          const delResult = await delRes.json();
          if (delRes.ok && delResult.success) {
            notify("User deleted successfully");
            loadAdminDashboardData();
          } else {
            notify("Failed to delete user: " + delResult.message);
          }
        } catch (err) {
          notify("Error deleting user.");
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadUserDashboardData(user) {
  try {
    const dashUserName = document.getElementById("dashUserName");
    if (dashUserName) dashUserName.textContent = user.name || "User";

    const res = await fetch(`${getApiBaseUrl()}/api/projects?user=${user._id || user.id}`);
    const result = await res.json();
    const projects = result.data?.items || [];

    const totalUploadsEl = document.getElementById("userTotalUploads");
    if (totalUploadsEl) totalUploadsEl.textContent = result.data?.pagination?.total || projects.length;

    const list = document.getElementById("userProjectsList");
    if (!list) return;
    
    if (!projects.length) {
      list.innerHTML = `
        <li class="glass" style="padding: 3rem; text-align: center; color: var(--text-secondary); border-radius: 20px; list-style: none;">
          <p style="font-size: 1.2rem; margin-bottom: 1.5rem;">You haven't shared any innovation yet.</p>
          <button class="btn btn-primary" onclick="window.scrollTo({top: document.getElementById('dashPanelUpload').offsetTop - 120, behavior: 'smooth'})">Get Started - Upload Now</button>
        </li>`;
      return;
    }

    list.innerHTML = "";
    projects.forEach(p => {
      const li = document.createElement("li");
      li.className = "glass project-list-item reveal visible";
      li.style.padding = "1.5rem";
      li.style.marginBottom = "1rem";
      li.style.borderRadius = "20px";
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      li.style.gap = "1.5rem";
      li.style.listStyle = "none";
      li.style.transition = "all 0.3s ease";
      
      li.innerHTML = `
        <div class="project-info" style="display: flex; align-items: center; gap: 1.5rem;">
          <div class="project-domain-icon" style="width: 54px; height: 54px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
            ${getDomainIcon(p.domain)}
          </div>
          <div class="project-details">
            <h4 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.4rem; color: #fff;">${p.title}</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 0.6rem;">
              <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; padding: 4px 10px; border-radius: 100px;">${p.domain}</span>
              ${(p.tags || []).slice(0, 3).map(t => `<span class="badge" style="background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.75rem; padding: 4px 10px; border-radius: 100px;">${t}</span>`).join('')}
            </div>
            <p style="font-size: 0.85rem; color: #64748b;">Shared on ${new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        <div class="project-actions" style="display: flex; gap: 0.75rem;">
          ${p.fileUrl ? `<a href="${getApiBaseUrl()}${p.fileUrl}" download class="btn btn-secondary" style="padding: 10px 20px; font-size: 0.85rem; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">Download</a>` : ''}
          <button class="btn btn-secondary edit-proj-btn" style="padding: 10px 20px; font-size: 0.85rem; border-radius: 10px;">Edit</button>
          <button class="btn btn-danger delete-proj-btn" style="padding: 10px 20px; font-size: 0.85rem; border-radius: 10px; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2);">Delete</button>
        </div>`;

      li.querySelector(".edit-proj-btn").addEventListener("click", () => openEditProjectModal(p));
      li.querySelector(".delete-proj-btn").addEventListener("click", () => deleteProject(p._id));
      
      list.appendChild(li);
    });
    
    if (typeof setupScrollReveal === 'function') setupScrollReveal();
  } catch (err) {
    console.error(err);
  }
}

function getDomainIcon(domain) {
  const icons = {
    'AI': '🤖',
    'Web Dev': '🌐',
    'IoT': '📡',
    'Mobile': '📱',
    'Data Science': '📊',
    'Cybersecurity': '🛡️',
    'Other': '📁'
  };
  return icons[domain] || '📁';
}

function openEditProjectModal(project) {
  document.getElementById("editProjectId").value = project._id;
  document.getElementById("editProjectTitle").value = project.title;
  document.getElementById("editProjectDomain").value = project.domain;
  document.getElementById("editProjectDifficulty").value = project.difficulty || "Medium";
  document.getElementById("editProjectDescription").value = project.description;
  document.getElementById("editProjectTags").value = (project.tags || []).join(", ");

  if (document.getElementById("editProjectGithub")) {
    document.getElementById("editProjectGithub").value = project.githubLink || "";
  }
  if (document.getElementById("editProjectDeploy")) {
    document.getElementById("editProjectDeploy").value = project.deployLink || "";
  }

  const modal = document.getElementById("editProjectModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }
}

function setupDashboardControls() {
  const editModal = document.getElementById("editProjectModal");
  const editModalClose = document.getElementById("editModalClose");
  const editForm = document.getElementById("editProjectForm");

  if (editModalClose) {
    editModalClose.addEventListener("click", () => {
      editModal.classList.add("hidden");
      editModal.setAttribute("aria-hidden", "true");
    });
  }

  if (editModal) {
    editModal.addEventListener("click", (event) => {
      if (event.target.dataset.closeEditModal === "true") {
        editModal.classList.add("hidden");
        editModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editProjectId").value;
      const payload = {
        title: document.getElementById("editProjectTitle").value,
        domain: document.getElementById("editProjectDomain").value,
        difficulty: document.getElementById("editProjectDifficulty").value,
        description: document.getElementById("editProjectDescription").value,
        tags: document.getElementById("editProjectTags").value.split(",").map(t => t.trim()).filter(Boolean),
        githubLink: document.getElementById("editProjectGithub")?.value || "",
        deployLink: document.getElementById("editProjectDeploy")?.value || "",
      };

      const token = localStorage.getItem("authToken");
      const submitBtn = document.getElementById("editProjectSubmitBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      try {
        const res = await fetch(`${getApiBaseUrl()}/api/projects/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (res.ok && result.success) {
          notify("Project updated successfully");
          editModal.classList.add("hidden");
          renderDashboardData();
        } else {
          notify(result.message || "Failed to update project");
        }
      } catch (err) {
        notify("Network error while updating project");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Changes";
      }
    });
  }
}

function setupAuth() {
  const tabs = [...document.querySelectorAll(".tab")];
  const title = document.getElementById("authTitle");
  const nameField = document.getElementById("nameField");
  const authForm = document.getElementById("authForm");
  const nameInput = document.getElementById("authName");
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");
  const submitBtn = document.getElementById("authSubmitBtn");
  const authStatusMessage = document.getElementById("authStatusMessage");
  let authMode = "login";

  function setAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === "signup";
    if (title) title.textContent = isSignup ? "Create Account" : "Welcome Back";
    if (nameField) nameField.classList.toggle("hidden", !isSignup);
    if (submitBtn) submitBtn.textContent = isSignup ? "Sign Up" : "Login";
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setAuthMode(tab.dataset.mode));
  });

  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password || (authMode === "signup" && !name)) {
        notify("Please fill all fields.");
        return;
      }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Processing...";

      try {
        const endpoint = authMode === "signup" ? "/api/auth/register" : "/api/auth/login";
        const body = authMode === "signup" ? { name, email, password } : { email, password };
        const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await response.json();

        if (response.ok && result.success) {
          setAuthSession(result.data.user, result.data.token);
          notify(authMode === "signup" ? "Account created!" : "Welcome back!");
          updateAuthNavUI();
          redirectToDashboard();
        } else {
          notify(result.message || "Authentication failed.");
        }
      } catch (error) {
        notify("Server connection failed. Please check your internet or try again later.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }
}

async function loadPlatformStats() {
  const projStat = document.getElementById("statProjectsCount");
  const userStat = document.getElementById("statUsersCount");
  if (!projStat && !userStat) return;

  try {
    const ts = Date.now();
    const [projRes, usersRes] = await Promise.all([
      fetch(`${getApiBaseUrl()}/api/projects?limit=1&_=${ts}`),
      fetch(`${getApiBaseUrl()}/api/public/count?_=${ts}`)
    ]);

    const projResult = await projRes.json();
    if (projResult.success && projStat) {
      projStat.textContent = projResult.data?.pagination?.total || 0;
    }

    if (usersRes.ok && userStat) {
      const userResult = await usersRes.json();
      userStat.textContent = userResult.count || 0;
    }
  } catch (err) {
    console.error("Stats load failed", err);
  }
}

function init() {
  window.addEventListener("hashchange", showSectionByHash);
  showSectionByHash();

  if (menuToggleButton && navWrap) {
    menuToggleButton.addEventListener("click", () => navWrap.classList.toggle("open"));
  }

  if (logoutNavBtn) {
    logoutNavBtn.addEventListener("click", () => {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      notify("Logged out successfully.");
      updateAuthNavUI();
      window.location.href = "index.html";
    });
  }

  updateAuthNavUI();

  // Auto-redirect if already logged in and on auth page
  if (window.location.pathname.endsWith("auth.html") && getCurrentUser()) {
    redirectToDashboard();
  }

  setupExplore();
  setupUploadForm();
  setupAuth();
  setupDashboardControls();
  renderDashboardData();
  setupScrollReveal();
  loadPlatformStats();
}

function setupScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Once visible, we can stop observing
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

async function deleteProject(id) {
  if (!confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) return;
  
  const token = localStorage.getItem("authToken");
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/projects/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    if (res.ok && result.success) {
      notify("Project deleted successfully");
      renderDashboardData();
    } else {
      notify(result.message || "Failed to delete project");
    }
  } catch (err) {
    notify("Network error while deleting project");
  }
}

document.addEventListener("DOMContentLoaded", init);

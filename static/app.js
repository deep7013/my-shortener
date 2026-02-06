/*************************************************
 * 🚀 DOM READY
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();

  const shortenForm = document.getElementById("shorten-form");
  if (shortenForm) {
    shortenForm.addEventListener("submit", handleShorten);
  }
});

/*************************************************
 * 🔑 AUTH UI BOOTSTRAP
 *************************************************/
function initAuthUI() {
  loadAuthState();
}

/*************************************************
 * 👤 LOAD AUTH STATE (SINGLE SOURCE OF TRUTH)
 *************************************************/
async function loadAuthState() {
  const userInfo = document.getElementById("user-info");
  const authActions = document.getElementById("auth-actions");

  if (!userInfo || !authActions) return;

  try {
    const res = await fetch("/me", {
      credentials: "same-origin"
    });

    if (!res.ok) throw new Error("Not logged in");

    const user = await res.json();

    // ✅ LOGGED IN
    userInfo.innerHTML = `👋 ${user.email}`;

    if (user.role === "admin") {
      authActions.innerHTML = `
        <a href="/admin">Admin</a> |
        <a href="/dashboard">Dashboard</a> |
        <button id="logout-btn">Logout</button>
      `;
    } else {
      authActions.innerHTML = `
        <a href="/dashboard">Dashboard</a> |
        <button id="logout-btn">Logout</button>
      `;
    }

    document.getElementById("logout-btn").onclick = logout;

  } catch {
    // ❌ GUEST
    userInfo.innerText = "Guest (5 links/hour)";
    authActions.innerHTML = `
      <button id="login-btn">Login</button>
      <button id="signup-btn">Create account</button>
    `;

    document.getElementById("login-btn").onclick = openLoginModal;
    document.getElementById("signup-btn").onclick = openSignupModal;
  }
}

/*************************************************
 * 🔐 LOGIN / SIGNUP MODAL
 *************************************************/
function openLoginModal() {
  setAuthMode("login");
  document.getElementById("auth-overlay").classList.remove("hidden");
}

function openSignupModal() {
  setAuthMode("signup");
  document.getElementById("auth-overlay").classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("auth-overlay").classList.add("hidden");
}

let authMode = "login";

function setAuthMode(mode) {
  authMode = mode;

  const title = document.getElementById("auth-title");
  const submit = document.getElementById("auth-submit");
  const toggle = document.getElementById("auth-toggle");
  const error = document.getElementById("auth-error");
  const forgot = document.getElementById("forgot-wrap");

  error.innerText = "";
  error.classList.add("hidden");
  forgot.classList.add("hidden");

  if (mode === "login") {
    title.innerText = "Login";
    submit.innerText = "Login";
    toggle.innerText = "New user? Create account";
  } else {
    title.innerText = "Create account";
    submit.innerText = "Create account";
    toggle.innerText = "Already have an account? Login";
  }
}

document.getElementById("auth-toggle")?.addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "signup" : "login");
});

/*************************************************
 * 🔑 AUTH SUBMIT
 *************************************************/
document.getElementById("auth-submit")?.addEventListener("click", async () => {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  const error = document.getElementById("auth-error");
  const forgot = document.getElementById("forgot-wrap");

  error.classList.add("hidden");
  forgot.classList.add("hidden");

  if (!email || !password) {
    error.innerText = "Email and password required";
    error.classList.remove("hidden");
    return;
  }

  const endpoint =
    authMode === "login" ? "/api/auth/login" : "/api/auth/signup";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    error.innerText = data.error || "Authentication failed";
    error.classList.remove("hidden");

    if (data.error === "Invalid credentials") {
      forgot.classList.remove("hidden");
    }

    if (data.error === "GOOGLE_ACCOUNT") {
      window.location.href = "/login/google";
    }

    return;
  }

  // ✅ Cookie set by backend
  window.location.href = "/dashboard";
});

/*************************************************
 * 🔁 FORGOT PASSWORD
 *************************************************/
document.getElementById("forgot-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("auth-email").value.trim();
  if (!email) {
    alert("Enter email first");
    return;
  }

  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  if (!res.ok && data.error === "GOOGLE_ACCOUNT") {
    window.location.href = "/login/google";
    return;
  }

  alert("OTP sent to your email");
});
const forgotBtn = document.getElementById("forgot-btn");

if (forgotBtn) {
  forgotBtn.addEventListener("click", () => {
    window.location.href = "/forgot";
  });
}

/*************************************************
 * 🔗 SHORTEN URL
 *************************************************/
async function handleShorten(e) {
  e.preventDefault();

  const payload = {
    long_url: document.getElementById("url").value,
    vanity: document.getElementById("vanity").value || null,
    expires_days: document.getElementById("expires").value || null
  };

  const res = await fetch("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || data.error || "Shorten failed");
    return;
  }

  document.getElementById("result").innerHTML = `
    <div class="link">
      <input id="short-url" value="${data.short_url}" readonly />
      <button id="copy-btn">Copy</button>
    </div>
  `;

  document.getElementById("copy-btn").onclick = copyLink;
}

/*************************************************
 * 📋 COPY LINK
 *************************************************/
function copyLink() {
  const input = document.getElementById("short-url");
  navigator.clipboard.writeText(input.value);
  alert("Copied to clipboard");
}

/*************************************************
 * 🚪 LOGOUT
 *************************************************/
function logout() {
  window.location.href = "/logout";
}
/*************************************************
 * 🗑️ DELETE LINK (USER)
 *************************************************/
function deleteLink(linkId) {
  if (!confirm("Are you sure you want to delete this link?")) {
    return;
  }

  fetch(`/api/links/${linkId}/delete`, {
    method: "POST",
    credentials: "same-origin"
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        location.reload();
      } else {
        alert(data.error || "Delete failed");
      }
    })
    .catch(err => {
      console.error("Delete error:", err);
      alert("Network error while deleting");
    });
}


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form")

  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault() // 🔑 THIS STOPS PAGE RELOAD

    const email = document.getElementById("signup-email").value
    const password = document.getElementById("signup-password").value

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Signup failed")
        return
      }

      // ✅ SAVE JWT
      localStorage.setItem("access_token", data.access_token)

      // ✅ GO TO SHORTENER PAGE
      window.location.href = "/"

    } catch (err) {
      alert("Network error during signup")
    }
  })
})

let email = ""

async function sendOTP() {
  email = document.getElementById("fp-email").value

  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })

  const data = await res.json()

  if (!res.ok && data.error === "GOOGLE_ACCOUNT") {
    alert("This account uses Google Sign-In.")
    window.location.href = "/login/google"
    return
  }

  document.getElementById("fp-message").innerText =
    data.message || "If email exists, OTP sent"

  document.getElementById("step-email").style.display = "none"
  document.getElementById("step-otp").style.display = "block"
}

async function verifyOTP() {
  const otp = document.getElementById("fp-otp").value

  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  })

  const data = await res.json()

  if (!res.ok) {
    document.getElementById("fp-message").innerText =
      data.error || "OTP verification failed"
    return
  }

  document.getElementById("step-otp").style.display = "none"
  document.getElementById("step-reset").style.display = "block"
}

async function resetPassword() {
  const new_password = document.getElementById("fp-new-password").value

  if (new_password.length < 8) {
    document.getElementById("fp-message").innerText =
      "Password must be at least 8 characters"
    return
  }

  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, new_password })
  })

  const data = await res.json()

  if (!res.ok) {
    document.getElementById("fp-message").innerText =
      data.error || "Password reset failed"
    return
  }

  alert("Password reset successful. Please login.")
  window.location.href = "/"
}

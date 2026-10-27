/**
 * NEXORA SYSTEM - INDEPENDENT DATABASE & AUTH CLIENT CONTROLLER
 * 
 * Handles Supabase Authentication, PostgreSQL Profile CRUD,
 * Database Trigger Observation, and Real-Time Synchronization.
 */

(function initDatabasePortal() {
    // DOM Elements - Navigation & Header
    const btnOpenAuth = document.querySelector("#btn-open-auth");
    const userHeaderPill = document.querySelector("#user-header-pill");
    const btnOpenProfile = document.querySelector("#btn-open-profile");
    const btnSignOut = document.querySelector("#btn-signout");
    const btnOpenSettings = document.querySelector("#btn-open-settings");
    const navAvatarImg = document.querySelector("#nav-avatar-img");
    const navUsernameText = document.querySelector("#nav-username-text");
    const heroProfileCta = document.querySelector("#hero-profile-cta");

    // Notification Toast
    const syncToast = document.querySelector("#sync-toast");
    const syncToastMessage = document.querySelector("#sync-toast-message");

    // Modals
    const authModal = document.querySelector("#auth-modal");
    const settingsModal = document.querySelector("#settings-modal");

    // Live Record Preview Elements
    const previewName = document.querySelector("#preview-name");
    const previewRoleText = document.querySelector("#preview-role-text");
    const previewUserId = document.querySelector("#preview-user-id");
    const previewAvatar = document.querySelector("#preview-avatar");
    const previewUpdatedAt = document.querySelector("#preview-updated-at");
    const previewCreatedAt = document.querySelector("#preview-created-at");

    // Database Editor Form Elements
    const profileEditForm = document.querySelector("#profile-edit-form");
    const profileDisplayName = document.querySelector("#profile-display-name");
    const profileGender = document.querySelector("#profile-gender");
    const profileAvatarUrl = document.querySelector("#profile-avatar-url");
    const profileBio = document.querySelector("#profile-bio");
    const profileHobbies = document.querySelector("#profile-hobbies");
    const profileStrengths = document.querySelector("#profile-strengths");
    const profileFeedback = document.querySelector("#profile-feedback");
    const btnSyncProfile = document.querySelector("#btn-sync-profile");
    const btnToggleAudits = document.querySelector("#btn-toggle-audits");

    // Audit Logs Elements
    const auditLogsSection = document.querySelector("#audit-logs-section");
    const auditLogsList = document.querySelector("#audit-logs-list");

    // In-Page Auth Form Elements
    const authForm = document.querySelector("#auth-form");
    const tabLogin = document.querySelector("#tab-login");
    const tabSignup = document.querySelector("#tab-signup");
    const groupDisplayName = document.querySelector("#group-display-name");
    const authModalTitle = document.querySelector("#auth-modal-title");
    const authBtnText = document.querySelector("#auth-btn-text");
    const authEmail = document.querySelector("#auth-email");
    const authPassword = document.querySelector("#auth-password");
    const authDisplayName = document.querySelector("#auth-display-name");
    const authErrorAlert = document.querySelector("#auth-error-alert");
    const authSuccessAlert = document.querySelector("#auth-success-alert");
    const btnGoogleAuth = document.querySelector("#btn-google-auth");

    // Settings Form Elements
    const settingsForm = document.querySelector("#settings-form");
    const settingsSupabaseUrl = document.querySelector("#settings-supabase-url");
    const settingsSupabaseKey = document.querySelector("#settings-supabase-key");
    const settingsApiUrl = document.querySelector("#settings-api-url");
    const settingsFeedback = document.querySelector("#settings-feedback");
    const btnResetSettings = document.querySelector("#btn-reset-settings");

    let isSignupMode = false;
    let cachedProfile = null;

    // Toast Notification Helper
    function showToast(message, duration = 3500) {
        if (!syncToast || !syncToastMessage) return;
        syncToastMessage.textContent = message;
        syncToast.classList.add("is-visible");
        setTimeout(() => {
            syncToast.classList.remove("is-visible");
        }, duration);
    }

    // Modal Helpers
    function openModal(modal) {
        if (modal && !modal.open) modal.showModal();
    }
    function closeModal(modal) {
        if (modal && modal.open) modal.close();
    }

    // UI Sign In / Out State Updaters
    function updateUIAfterSignOut() {
        if (btnOpenAuth) btnOpenAuth.style.display = "inline-flex";
        if (userHeaderPill) userHeaderPill.style.display = "none";
        cachedProfile = null;
        if (previewUserId) previewUserId.textContent = "Unauthenticated";
    }

    function updateUIAfterSignIn(user, profile) {
        if (btnOpenAuth) btnOpenAuth.style.display = "none";
        if (userHeaderPill) userHeaderPill.style.display = "inline-flex";

        const name = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Operator";
        const avatar = profile?.avatar_url || "assets/robot.svg";

        if (navUsernameText) navUsernameText.textContent = name;
        if (navAvatarImg) navAvatarImg.src = avatar;
    }

    // Sign Out Handler
    async function handleSignOut() {
        try {
            await window.nexoraAuth.signOut();
            updateUIAfterSignOut();
            showToast("✓ Signed out successfully. Session cleared.");
        } catch (err) {
            console.error("Sign out error:", err);
            updateUIAfterSignOut();
            showToast("Notice: Session cleared locally.");
        }
    }

    if (btnSignOut) btnSignOut.addEventListener("click", handleSignOut);

    // Profile & Database Record Loader
    async function loadAndDisplayProfile(forceRefetch = false) {
        try {
            const { profile, source } = await window.nexoraAuth.getProfile();
            cachedProfile = profile;

            // Render into Preview Card (null-safe)
            if (previewName) previewName.textContent = profile.display_name || "Vargav Lead Engineer";
            if (previewUserId) previewUserId.textContent = `UUID: ${profile.id}`;
            if (previewAvatar && profile.avatar_url) previewAvatar.src = profile.avatar_url;

            const updatedTime = profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "Just now";
            if (previewUpdatedAt) previewUpdatedAt.textContent = updatedTime;
            if (previewCreatedAt) previewCreatedAt.textContent = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Active";

            // Render into Form inputs (null-safe)
            if (profileDisplayName) profileDisplayName.value = profile.display_name || "";
            if (profileGender) profileGender.value = profile.gender || "unspecified";
            if (profileAvatarUrl) profileAvatarUrl.value = profile.avatar_url || "";
            if (profileBio) profileBio.value = profile.bio || "";
            if (profileHobbies) profileHobbies.value = Array.isArray(profile.hobbies) ? profile.hobbies.join(", ") : (profile.hobbies || "");
            if (profileStrengths) profileStrengths.value = Array.isArray(profile.strengths) ? profile.strengths.join(", ") : (profile.strengths || "");

            updateUIAfterSignIn(window.nexoraAuth.currentUser, profile);

            if (forceRefetch) {
                showToast(`✓ Database synchronized via ${source}! Trigger timestamp verified.`);
            }
        } catch (err) {
            console.error("Error loading database record:", err);
            showToast(`Notice: ${err.message}`);
        }
    }

    // Database Update Submission (Fires PostgreSQL Trigger)
    if (profileEditForm) {
        profileEditForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (profileFeedback) profileFeedback.style.display = "none";
            const btnSave = document.querySelector("#btn-save-profile span");
            if (btnSave) btnSave.textContent = "Writing to PostgreSQL...";

            try {
                const hobbiesArr = profileHobbies ? profileHobbies.value.split(",").map(s => s.trim()).filter(Boolean) : [];
                const strengthsArr = profileStrengths ? profileStrengths.value.split(",").map(s => s.trim()).filter(Boolean) : [];

                const updates = {
                    display_name: profileDisplayName ? profileDisplayName.value.trim() : "",
                    gender: profileGender ? profileGender.value : "unspecified",
                    avatar_url: profileAvatarUrl ? profileAvatarUrl.value.trim() : "",
                    bio: profileBio ? profileBio.value.trim() : "",
                    hobbies: hobbiesArr,
                    strengths: strengthsArr,
                };

                const { profile, source } = await window.nexoraAuth.updateProfile(updates);
                cachedProfile = profile;

                if (profileFeedback) {
                    profileFeedback.className = "feedback-alert success";
                    profileFeedback.textContent = `✓ PostgreSQL updated & trigger executed via ${source}!`;
                    profileFeedback.style.display = "block";
                }

                // Refresh UI with latest database state
                await loadAndDisplayProfile();
                showToast("PostgreSQL updated_at trigger executed successfully!");
            } catch (err) {
                console.error("Database update error:", err);
                if (profileFeedback) {
                    profileFeedback.className = "feedback-alert error";
                    profileFeedback.textContent = err.message || "Failed to update database record";
                    profileFeedback.style.display = "block";
                }
            } finally {
                if (btnSave) btnSave.textContent = "Save & Execute PostgreSQL Trigger";
            }
        });
    }

    // Force Sync Button
    if (btnSyncProfile) {
        btnSyncProfile.addEventListener("click", () => {
            loadAndDisplayProfile(true);
        });
    }

    // Avatar Presets Click
    document.querySelectorAll(".preset-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const url = btn.dataset.url;
            if (profileAvatarUrl) profileAvatarUrl.value = url;
            if (previewAvatar) previewAvatar.src = url;
        });
    });

    if (profileAvatarUrl) {
        profileAvatarUrl.addEventListener("input", (e) => {
            if (previewAvatar) previewAvatar.src = e.target.value.trim() || "assets/robot.svg";
        });
    }

    // Toggle Audit Logs Panel
    if (btnToggleAudits) {
        btnToggleAudits.addEventListener("click", async () => {
            if (!auditLogsSection) return;
            const isHidden = auditLogsSection.style.display === "none";
            if (isHidden) {
                auditLogsSection.style.display = "block";
                btnToggleAudits.textContent = "Hide Trigger Audit Logs";
                await renderAuditLogs();
            } else {
                auditLogsSection.style.display = "none";
                btnToggleAudits.textContent = "📜 View Trigger Audit Logs";
            }
        });
    }

    async function renderAuditLogs() {
        if (!auditLogsList) return;
        auditLogsList.replaceChildren();
        const logs = await window.nexoraAuth.getAuditLogs();

        if (!logs || logs.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-audits";
            empty.textContent = "No trigger audit entries recorded yet. Edit a field and save to generate an audit log!";
            auditLogsList.appendChild(empty);
            return;
        }

        logs.forEach((log) => {
            const item = document.createElement("div");
            item.className = "audit-item";
            const time = new Date(log.performed_at).toLocaleString();
            item.innerHTML = `
                <div><strong>Action:</strong> ${log.action} | <span class="audit-item-time">${time}</span></div>
                <div style="font-family: monospace; font-size: 0.72rem; margin-top: 4px; color: var(--muted);">
                    Recorded automatically by trigger_profile_audit in PostgreSQL
                </div>
            `;
            auditLogsList.appendChild(item);
        });
    }

    // In-Page Auth Modal Handlers
    function setAuthMode(signup) {
        isSignupMode = signup;
        if (authErrorAlert) authErrorAlert.style.display = "none";
        if (authSuccessAlert) authSuccessAlert.style.display = "none";

        if (signup) {
            if (tabSignup) tabSignup.classList.add("active");
            if (tabLogin) tabLogin.classList.remove("active");
            if (groupDisplayName) groupDisplayName.style.display = "flex";
            if (authModalTitle) authModalTitle.textContent = "Register Operator Account";
            if (authBtnText) authBtnText.textContent = "Create Account";
        } else {
            if (tabLogin) tabLogin.classList.add("active");
            if (tabSignup) tabSignup.classList.remove("active");
            if (groupDisplayName) groupDisplayName.style.display = "none";
            if (authModalTitle) authModalTitle.textContent = "System Sign In";
            if (authBtnText) authBtnText.textContent = "Sign In";
        }
    }

    if (tabLogin) tabLogin.addEventListener("click", () => setAuthMode(false));
    if (tabSignup) tabSignup.addEventListener("click", () => setAuthMode(true));

    if (btnGoogleAuth) {
        btnGoogleAuth.addEventListener("click", async () => {
            try {
                await window.nexoraAuth.signInWithGoogle();
            } catch (err) {
                if (authErrorAlert) {
                    authErrorAlert.textContent = err.message || "Failed to initiate Google OAuth";
                    authErrorAlert.style.display = "block";
                }
            }
        });
    }

    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (authErrorAlert) authErrorAlert.style.display = "none";
            if (authSuccessAlert) authSuccessAlert.style.display = "none";
            if (authBtnText) authBtnText.textContent = "Authenticating...";

            try {
                const email = authEmail.value.trim();
                const password = authPassword.value;
                const displayName = authDisplayName ? authDisplayName.value.trim() : "";

                if (isSignupMode) {
                    await window.nexoraAuth.signUp(email, password, displayName);
                    if (authSuccessAlert) {
                        authSuccessAlert.textContent = "Account registered! Accessing database portal...";
                        authSuccessAlert.style.display = "block";
                    }
                } else {
                    await window.nexoraAuth.signIn(email, password);
                    if (authSuccessAlert) {
                        authSuccessAlert.textContent = "Signed in successfully!";
                        authSuccessAlert.style.display = "block";
                    }
                }

                setTimeout(() => {
                    closeModal(authModal);
                    setAuthMode(false);
                    loadAndDisplayProfile();
                }, 800);
            } catch (err) {
                console.error("Auth error:", err);
                if (authErrorAlert) {
                    authErrorAlert.textContent = err.message || "Authentication failed. Check credentials.";
                    authErrorAlert.style.display = "block";
                }
            } finally {
                if (authBtnText) authBtnText.textContent = isSignupMode ? "Create Account" : "Sign In";
            }
        });
    }

    // Modal Triggers
    if (heroProfileCta) {
        heroProfileCta.addEventListener("click", () => {
            const editorCard = document.querySelector(".record-editor-card");
            if (editorCard) {
                editorCard.scrollIntoView({ behavior: "smooth" });
            }
            loadAndDisplayProfile();
        });
    }

    if (btnOpenProfile) {
        btnOpenProfile.addEventListener("click", () => {
            const workbench = document.querySelector(".workbench-section");
            if (workbench) workbench.scrollIntoView({ behavior: "smooth" });
            loadAndDisplayProfile();
        });
    }

    document.querySelectorAll("[data-close-auth]").forEach(btn => btn.addEventListener("click", () => closeModal(authModal)));
    document.querySelectorAll("[data-close-settings]").forEach(btn => btn.addEventListener("click", () => closeModal(settingsModal)));

    // Settings Modal Handlers
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener("click", () => {
            if (settingsSupabaseUrl) {
                settingsSupabaseUrl.value = window.NEXORA_CONFIG.SUPABASE_URL.includes("placeholder") ? "" : window.NEXORA_CONFIG.SUPABASE_URL;
            }
            if (settingsSupabaseKey) {
                settingsSupabaseKey.value = window.NEXORA_CONFIG.SUPABASE_ANON_KEY.includes("placeholder") ? "" : window.NEXORA_CONFIG.SUPABASE_ANON_KEY;
            }
            if (settingsApiUrl) {
                settingsApiUrl.value = window.NEXORA_CONFIG.API_BASE_URL;
            }
            openModal(settingsModal);
        });
    }

    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const url = settingsSupabaseUrl ? settingsSupabaseUrl.value.trim() : "";
            const key = settingsSupabaseKey ? settingsSupabaseKey.value.trim() : "";
            const api = settingsApiUrl ? settingsApiUrl.value.trim() : "";

            window.NEXORA_CONFIG.saveConfig(url, key, api);
            window.nexoraAuth.initClient();

            if (settingsFeedback) {
                settingsFeedback.className = "feedback-alert success";
                settingsFeedback.textContent = "✓ Settings saved! Reconnected to database.";
                settingsFeedback.style.display = "block";
            }

            setTimeout(() => {
                closeModal(settingsModal);
                if (settingsFeedback) settingsFeedback.style.display = "none";
                showToast("Configuration updated. Reconnected!");
            }, 800);
        });
    }

    if (btnResetSettings) {
        btnResetSettings.addEventListener("click", () => {
            window.NEXORA_CONFIG.resetConfig();
            if (settingsSupabaseUrl) settingsSupabaseUrl.value = "";
            if (settingsSupabaseKey) settingsSupabaseKey.value = "";
            showToast("Settings reset to defaults.");
        });
    }

    // Initialize Auth state listener
    window.nexoraAuth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            loadAndDisplayProfile();
        } else {
            updateUIAfterSignOut();
            // Still load public profile record
            loadAndDisplayProfile();
        }
    });

    // Initial load
    loadAndDisplayProfile();
})();

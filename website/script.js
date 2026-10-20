
const robotProducts = {
    home: {
        name: "NEXORA Home",
        category: "DOMESTIC ASSISTANCE",
        description:
            "A fictional domestic humanoid concept designed to assist with everyday routines and interact with smart environments.",
        features: [
            "Conceptual voice interaction",
            "Smart-home integration concept",
            "Assistance with routine tasks",
            "Human-centered design"
        ]
    },

    industrial: {
        name: "NEXORA Industrial",
        category: "INDUSTRIAL SUPPORT",
        description:
            "A fictional industrial humanoid concept designed for logistics support and repetitive workplace activities.",
        features: [
            "Conceptual operator interface",
            "Warehouse assistance concept",
            "Repetitive-task support",
            "Industrial environment design"
        ]
    },

    care: {
        name: "NEXORA Care",
        category: "COMPANION ROBOTICS",
        description:
            "A fictional companion robot concept for welcoming environments, hospitality, and guided assistance.",
        features: [
            "Conceptual conversational interface",
            "Visitor guidance concept",
            "Hospitality assistance",
            "Accessible interaction design"
        ]
    }
};

const productButtons = document.querySelectorAll("[data-product]");

function closeProductDialog() {
    const dialog = document.querySelector("#product-dialog");

    if (dialog?.open) {
        dialog.close();
    }
}

function openProductDialog(productKey) {
    const product = robotProducts[productKey];

    if (!product) {
        return;
    }

    const dialog = document.querySelector("#product-dialog");

    document.querySelector("#dialog-category").textContent =
        product.category;

    document.querySelector("#dialog-title").textContent =
        product.name;

    document.querySelector("#dialog-description").textContent =
        product.description;

    const featureList = document.querySelector("#dialog-features");
    featureList.replaceChildren();

    product.features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        featureList.appendChild(item);
    });

    dialog.showModal();
}

productButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openProductDialog(button.dataset.product);
    });
});

document.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-dialog]")) {
        closeProductDialog();
    }
});

/* NEXORA robot comparison functionality */

const comparisonProducts = {
    home: {
        name: "NEXORA Home",
        role: "Personal home assistance",
        interaction: "Voice and touch",
        environment: "Residential spaces",
        focus: "Everyday convenience and assistance"
    },

    industrial: {
        name: "NEXORA Industrial",
        role: "Industrial task assistance",
        interaction: "Operator controls and voice",
        environment: "Factories and industrial facilities",
        focus: "Workflow support and operational efficiency"
    },

    care: {
        name: "NEXORA Care",
        role: "Care and companionship assistance",
        interaction: "Voice and touch",
        environment: "Care facilities and home environments",
        focus: "Companionship and daily support"
    }
};

const comparisonSection = document.querySelector("#compare");

if (comparisonSection) {
    const comparisonInputs = [
        ...comparisonSection.querySelectorAll(
            '.comparison-option input[type="checkbox"]'
        )
    ];

    const comparisonResults = comparisonSection.querySelector(
        "#comparison-results"
    );

    const resetComparisonButton = comparisonSection.querySelector(
        "#reset-comparison"
    );

    function renderComparison() {
        const selectedRobots = comparisonInputs
            .filter(input => input.checked)
            .map(input => comparisonProducts[input.value])
            .filter(Boolean);

        if (selectedRobots.length < 2) {
            const message = document.createElement("p");
            message.textContent =
                "Select at least two robots to compare them.";

            comparisonResults.replaceChildren(message);
            return;
        }

        const features = [
            { label: "Primary role", key: "role" },
            { label: "Interaction", key: "interaction" },
            { label: "Intended environment", key: "environment" },
            { label: "Design focus", key: "focus" }
        ];

        const table = document.createElement("table");
        table.className = "comparison-table";

        const tableHead = document.createElement("thead");
        const headingRow = document.createElement("tr");
        const featureHeading = document.createElement("th");

        featureHeading.textContent = "Feature";
        headingRow.appendChild(featureHeading);

        selectedRobots.forEach(robot => {
            const heading = document.createElement("th");
            heading.textContent = robot.name;
            headingRow.appendChild(heading);
        });

        tableHead.appendChild(headingRow);
        table.appendChild(tableHead);

        const tableBody = document.createElement("tbody");

        features.forEach(feature => {
            const row = document.createElement("tr");
            const labelCell = document.createElement("td");

            labelCell.textContent = feature.label;
            row.appendChild(labelCell);

            selectedRobots.forEach(robot => {
                const cell = document.createElement("td");
                cell.textContent = robot[feature.key];
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        comparisonResults.replaceChildren(table);
    }

    comparisonInputs.forEach(input => {
        input.addEventListener("change", renderComparison);
    });

    resetComparisonButton.addEventListener("click", () => {
        comparisonInputs.forEach(input => {
            input.checked =
                input.value === "home" ||
                input.value === "industrial";
        });

        renderComparison();
    });

    renderComparison();
}

/* NEXORA scroll-reveal observer */

const revealElements = document.querySelectorAll(
    ".products-section .product-card, " +
    ".comparison-section, " +
    "#about, " +
    "#contact"
);

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(element => {
        element.classList.add("is-visible");
    });
} else {
    revealElements.forEach(element => {
        element.classList.add("reveal-on-scroll");
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}


/* ==============================================================================
   NEXORA ROBOTICS - AUTH & PROFILE CLIENT CONTROLLER
   ============================================================================== */

(function initNexoraPortal() {
    // DOM Elements
    const authModal = document.querySelector("#auth-modal");
    const profileModal = document.querySelector("#profile-modal");
    const settingsModal = document.querySelector("#settings-modal");
    const syncToast = document.querySelector("#sync-toast");
    const syncToastMessage = document.querySelector("#sync-toast-message");

    const btnOpenAuth = document.querySelector("#btn-open-auth");
    const btnOpenProfile = document.querySelector("#btn-open-profile");
    const btnSignOut = document.querySelector("#btn-signout");
    const btnModalSignOut = document.querySelector("#btn-modal-signout");
    const btnOpenSettings = document.querySelector("#btn-open-settings");
    const heroProfileCta = document.querySelector("#hero-profile-cta");

    const userHeaderPill = document.querySelector("#user-header-pill");
    const navAvatarImg = document.querySelector("#nav-avatar-img");
    const navUsernameText = document.querySelector("#nav-username-text");

    // Auth Form Elements
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
    const btnDemoFill = document.querySelector("#btn-demo-fill");
    const btnGoogleAuth = document.querySelector("#btn-google-auth");

    // Profile Form Elements
    const profileForm = document.querySelector("#profile-edit-form");
    const previewAvatar = document.querySelector("#preview-avatar");
    const previewName = document.querySelector("#preview-name");
    const previewUserId = document.querySelector("#preview-user-id");
    const previewUpdatedAt = document.querySelector("#preview-updated-at");
    const previewCreatedAt = document.querySelector("#preview-created-at");
    const profileDisplayName = document.querySelector("#profile-display-name");
    const profileGender = document.querySelector("#profile-gender");
    const profileAvatarUrl = document.querySelector("#profile-avatar-url");
    const profileBio = document.querySelector("#profile-bio");
    const profileHobbies = document.querySelector("#profile-hobbies");
    const profileStrengths = document.querySelector("#profile-strengths");
    const profileFeedback = document.querySelector("#profile-feedback");
    const btnSyncProfile = document.querySelector("#btn-sync-profile");
    const btnToggleAudits = document.querySelector("#btn-toggle-audits");
    const auditLogsSection = document.querySelector("#audit-logs-section");
    const auditLogsList = document.querySelector("#audit-logs-list");

    // Settings Form Elements
    const settingsForm = document.querySelector("#settings-form");
    const settingsSupabaseUrl = document.querySelector("#settings-supabase-url");
    const settingsSupabaseKey = document.querySelector("#settings-supabase-key");
    const settingsApiUrl = document.querySelector("#settings-api-url");
    const settingsFeedback = document.querySelector("#settings-feedback");
    const btnResetSettings = document.querySelector("#btn-reset-settings");

    let isSignupMode = false;
    let cachedProfile = null;

    // Toast helper
    function showToast(message, duration = 3500) {
        if (!syncToast) return;
        syncToastMessage.textContent = message;
        syncToast.classList.add("is-visible");
        setTimeout(() => {
            syncToast.classList.remove("is-visible");
        }, duration);
    }

    // Modal helpers
    function openModal(modal) {
        if (modal && !modal.open) modal.showModal();
    }
    function closeModal(modal) {
        if (modal && modal.open) modal.close();
    }

    // Tab switcher
    function setAuthMode(signup) {
        isSignupMode = signup;
        authErrorAlert.style.display = "none";
        authSuccessAlert.style.display = "none";

        if (signup) {
            tabSignup.classList.add("active");
            tabLogin.classList.remove("active");
            groupDisplayName.style.display = "flex";
            authModalTitle.textContent = "Register NEXORA Pilot";
            authBtnText.textContent = "Create Account";
        } else {
            tabLogin.classList.add("active");
            tabSignup.classList.remove("active");
            groupDisplayName.style.display = "none";
            authModalTitle.textContent = "NEXORA Pilot Authentication";
            authBtnText.textContent = "Sign In";
        }
    }

    if (tabLogin) tabLogin.addEventListener("click", () => setAuthMode(false));
    if (tabSignup) tabSignup.addEventListener("click", () => setAuthMode(true));

    // Demo credentials autofill
    if (btnDemoFill) {
        btnDemoFill.addEventListener("click", () => {
            authEmail.value = "pilot.demo@nexora.io";
            authPassword.value = "NexoraPass2026!";
            if (isSignupMode) {
                authDisplayName.value = "Commander Sarah (Demo)";
            }
        });
    }

    // Google OAuth Handler
    if (btnGoogleAuth) {
        btnGoogleAuth.addEventListener("click", async () => {
            try {
                await window.nexoraAuth.signInWithGoogle();
            } catch (err) {
                authErrorAlert.textContent = err.message || "Failed to initiate Google OAuth";
                authErrorAlert.style.display = "block";
            }
        });
    }

    // Auth Submission
    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            authErrorAlert.style.display = "none";
            authSuccessAlert.style.display = "none";
            authBtnText.textContent = "Authenticating...";

            try {
                const email = authEmail.value.trim();
                const password = authPassword.value;
                const displayName = authDisplayName ? authDisplayName.value.trim() : "";

                if (isSignupMode) {
                    await window.nexoraAuth.signUp(email, password, displayName);
                    authSuccessAlert.textContent = "Account registered successfully! Accessing portal...";
                    authSuccessAlert.style.display = "block";
                } else {
                    await window.nexoraAuth.signIn(email, password);
                    authSuccessAlert.textContent = "Signed in successfully!";
                    authSuccessAlert.style.display = "block";
                }

                setTimeout(() => {
                    closeModal(authModal);
                    setAuthMode(false);
                    loadAndDisplayProfile();
                }, 800);
            } catch (err) {
                console.error("Auth error:", err);
                authErrorAlert.textContent = err.message || "Authentication failed. Check credentials.";
                authErrorAlert.style.display = "block";
            } finally {
                authBtnText.textContent = isSignupMode ? "Create Account" : "Sign In";
            }
        });
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
            showToast("Signed out. Session cleared.");
        }
    }

    if (btnSignOut) btnSignOut.addEventListener("click", handleSignOut);
    if (btnModalSignOut) btnModalSignOut.addEventListener("click", handleSignOut);

    function updateUIAfterSignOut() {
        if (btnOpenAuth) btnOpenAuth.style.display = "inline-flex";
        if (userHeaderPill) userHeaderPill.style.display = "none";
        cachedProfile = null;
        closeModal(profileModal);
    }

    function updateUIAfterSignIn(user, profile) {
        if (btnOpenAuth) btnOpenAuth.style.display = "none";
        if (userHeaderPill) userHeaderPill.style.display = "inline-flex";

        const name = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Pilot";
        const avatar = profile?.avatar_url || "assets/robot.svg";

        if (navUsernameText) navUsernameText.textContent = name;
        if (navAvatarImg) navAvatarImg.src = avatar;
    }

    // Profile Loader
    async function loadAndDisplayProfile(forceRefetch = false) {
        try {
            const { profile, source } = await window.nexoraAuth.getProfile();
            cachedProfile = profile;

            // Render into Preview Card (null-safe)
            if (previewName) previewName.textContent = profile.display_name || "Unnamed Pilot";
            if (previewUserId) previewUserId.textContent = `UUID: ${profile.id}`;
            if (previewAvatar) previewAvatar.src = profile.avatar_url || "assets/robot.svg";

            const updatedTime = profile.updated_at ? new Date(profile.updated_at).toLocaleTimeString() : "Just now";
            if (previewUpdatedAt) previewUpdatedAt.textContent = `${updatedTime} UTC`;
            if (previewCreatedAt) previewCreatedAt.textContent = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Today";

            // Render into Form inputs (null-safe)
            if (profileDisplayName) profileDisplayName.value = profile.display_name || "";
            if (profileGender) profileGender.value = profile.gender || "unspecified";
            if (profileAvatarUrl) profileAvatarUrl.value = profile.avatar_url || "";
            if (profileBio) profileBio.value = profile.bio || "";
            if (profileHobbies) profileHobbies.value = Array.isArray(profile.hobbies) ? profile.hobbies.join(", ") : (profile.hobbies || "");
            if (profileStrengths) profileStrengths.value = Array.isArray(profile.strengths) ? profile.strengths.join(", ") : (profile.strengths || "");

            updateUIAfterSignIn(window.nexoraAuth.currentUser, profile);

            if (forceRefetch) {
                showToast(`Profile synchronized via ${source}! Trigger timestamp verified.`);
            }
        } catch (err) {
            console.error("Error loading profile:", err);
            showToast(`Profile sync notice: ${err.message}`);
        }
    }

    // Save Profile
    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            profileFeedback.style.display = "none";
            const btnSave = document.querySelector("#btn-save-profile span");
            btnSave.textContent = "Saving to PostgreSQL...";

            try {
                const hobbiesArr = profileHobbies.value
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean);

                const strengthsArr = profileStrengths.value
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean);

                const updates = {
                    display_name: profileDisplayName.value.trim(),
                    gender: profileGender.value,
                    avatar_url: profileAvatarUrl.value.trim(),
                    bio: profileBio.value.trim(),
                    hobbies: hobbiesArr,
                    strengths: strengthsArr,
                };

                const { profile, source } = await window.nexoraAuth.updateProfile(updates);
                cachedProfile = profile;

                profileFeedback.className = "feedback-alert success";
                profileFeedback.textContent = `✓ Profile updated & trigger verified via ${source}!`;
                profileFeedback.style.display = "block";

                // Refresh UI with database values
                await loadAndDisplayProfile();
                showToast("PostgreSQL updated_at trigger executed successfully!");
            } catch (err) {
                console.error("Profile update error:", err);
                profileFeedback.className = "feedback-alert error";
                profileFeedback.textContent = err.message || "Failed to update profile";
                profileFeedback.style.display = "block";
            } finally {
                btnSave.textContent = "Save & Sync to Database";
            }
        });
    }

    // Avatar Presets Click
    document.querySelectorAll(".preset-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const url = btn.dataset.url;
            profileAvatarUrl.value = url;
            previewAvatar.src = url;
        });
    });

    if (profileAvatarUrl) {
        profileAvatarUrl.addEventListener("input", (e) => {
            previewAvatar.src = e.target.value.trim() || "assets/robot.svg";
        });
    }

    // Sync button
    if (btnSyncProfile) {
        btnSyncProfile.addEventListener("click", () => {
            loadAndDisplayProfile(true);
        });
    }

    // Toggle Audits
    if (btnToggleAudits) {
        btnToggleAudits.addEventListener("click", async () => {
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
        auditLogsList.replaceChildren();
        const logs = await window.nexoraAuth.getAuditLogs();

        if (!logs || logs.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-audits";
            empty.textContent = "No trigger audit entries found for this user.";
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
                    Updated fields recorded in PostgreSQL trigger
                </div>
            `;
            auditLogsList.appendChild(item);
        });
    }

    // Open & Close Modal Listeners
    if (btnOpenAuth) btnOpenAuth.addEventListener("click", () => openModal(authModal));
    if (heroProfileCta) {
        heroProfileCta.addEventListener("click", () => {
            if (window.nexoraAuth.currentUser) {
                openModal(profileModal);
                loadAndDisplayProfile();
            } else {
                openModal(authModal);
            }
        });
    }
    if (btnOpenProfile) {
        btnOpenProfile.addEventListener("click", () => {
            openModal(profileModal);
            loadAndDisplayProfile();
        });
    }

    // Close buttons
    document.querySelectorAll("[data-close-auth]").forEach(btn => btn.addEventListener("click", () => closeModal(authModal)));
    document.querySelectorAll("[data-close-profile]").forEach(btn => btn.addEventListener("click", () => closeModal(profileModal)));
    document.querySelectorAll("[data-close-settings]").forEach(btn => btn.addEventListener("click", () => closeModal(settingsModal)));

    // Settings Modal
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener("click", () => {
            settingsSupabaseUrl.value = window.NEXORA_CONFIG.SUPABASE_URL.includes("placeholder") ? "" : window.NEXORA_CONFIG.SUPABASE_URL;
            settingsSupabaseKey.value = window.NEXORA_CONFIG.SUPABASE_ANON_KEY.includes("placeholder") ? "" : window.NEXORA_CONFIG.SUPABASE_ANON_KEY;
            settingsApiUrl.value = window.NEXORA_CONFIG.API_BASE_URL;
            openModal(settingsModal);
        });
    }

    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const url = settingsSupabaseUrl.value.trim();
            const key = settingsSupabaseKey.value.trim();
            const api = settingsApiUrl.value.trim();

            window.NEXORA_CONFIG.saveConfig(url, key, api);
            window.nexoraAuth.initClient();

            settingsFeedback.className = "feedback-alert success";
            settingsFeedback.textContent = "✓ Settings saved! Reconnecting to database...";
            settingsFeedback.style.display = "block";

            setTimeout(() => {
                closeModal(settingsModal);
                settingsFeedback.style.display = "none";
                showToast("Configuration updated. Reconnected!");
            }, 800);
        });
    }

    if (btnResetSettings) {
        btnResetSettings.addEventListener("click", () => {
            window.NEXORA_CONFIG.resetConfig();
            settingsSupabaseUrl.value = "";
            settingsSupabaseKey.value = "";
            settingsApiUrl.value = window.NEXORA_CONFIG.API_BASE_URL;
            showToast("Settings reset to defaults.");
        });
    }

    // Auth state listener initialization
    window.nexoraAuth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            loadAndDisplayProfile();
        } else {
            updateUIAfterSignOut();
        }
    });

    // Periodic synchronization check (every 15 seconds, refreshes profile if active)
    setInterval(() => {
        if (window.nexoraAuth.currentUser && profileModal?.open) {
            loadAndDisplayProfile();
        }
    }, 15000);
})();

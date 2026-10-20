/**
 * NEXORA Robotics - Supabase Auth, Profile, and Backend API Service
 * 
 * Handles client-side authentication, session persistence, profile sync,
 * and database trigger observation.
 */

class NexoraAuthService {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.currentSession = null;
    this.initClient();
  }

  initClient() {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.NEXORA_CONFIG;
    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('placeholder')) {
      try {
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      }
    }
  }

  isConfigured() {
    return Boolean(
      this.client &&
      window.NEXORA_CONFIG.SUPABASE_URL &&
      !window.NEXORA_CONFIG.SUPABASE_URL.includes('placeholder')
    );
  }

  /**
   * Listen for Auth state changes (sign in, sign out, token refresh)
   */
  onAuthStateChange(callback) {
    if (!this.client) {
      // Mock session fallback for demonstration if not configured
      const localMock = window.localStorage.getItem('nexora_mock_session');
      if (localMock) {
        const session = JSON.parse(localMock);
        this.currentSession = session;
        this.currentUser = session.user;
        callback('SIGNED_IN', session);
      } else {
        callback('SIGNED_OUT', null);
      }
      return () => {};
    }

    const { data: { subscription } } = this.client.auth.onAuthStateChange(async (event, session) => {
      this.currentSession = session;
      this.currentUser = session?.user || null;
      callback(event, session);
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Sign up with Email and Password
   */
  async signUp(email, password, displayName) {
    if (!this.client) {
      return this._mockSignUp(email, password, displayName);
    }

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign in with Email and Password
   */
  async signIn(email, password) {
    if (!this.client) {
      return this._mockSignIn(email, password);
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    this.currentSession = data.session;
    this.currentUser = data.user;
    return data;
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    if (!this.client) {
      throw new Error('Supabase project credentials not configured yet. Configure them in settings.');
    }

    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out current user
   */
  async signOut() {
    if (!this.client) {
      window.localStorage.removeItem('nexora_mock_session');
      window.localStorage.removeItem('nexora_mock_profile');
      this.currentSession = null;
      this.currentUser = null;
      return;
    }

    const { error } = await this.client.auth.signOut();
    if (error) throw error;
    this.currentSession = null;
    this.currentUser = null;
  }

  /**
   * Fetch current user's profile from Backend API (with direct Supabase fallback)
   */
  async getProfile() {
    const token = this.currentSession?.access_token;
    const apiUrl = window.NEXORA_CONFIG.API_BASE_URL;

    // 1. Primary: Shared Backend REST API
    if (token) {
      try {
        const response = await fetch(`${apiUrl}/v1/profile/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            return { profile: result.data, source: 'backend-api' };
          }
        }
      } catch (backendErr) {
        console.warn('Backend API unreachable, falling back to direct Supabase PostgreSQL query:', backendErr.message);
      }
    }

    // 2. Direct Supabase Query (Fallback if backend is offline)
    if (this.client && this.currentUser) {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      if (data) {
        return { profile: data, source: 'supabase-direct' };
      }

      // If no profile row exists, create one
      const defaultName = this.currentUser.user_metadata?.display_name || this.currentUser.email?.split('@')[0] || 'Nexora Pioneer';
      const { data: newProfile, error: insertError } = await this.client
        .from('profiles')
        .insert({
          id: this.currentUser.id,
          display_name: defaultName,
          bio: 'Robotics Explorer and Nexora Pioneer.',
          gender: 'unspecified',
          hobbies: ['Robotics', 'Autonomous Systems'],
          strengths: ['Systems Thinking', 'Prototyping'],
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return { profile: newProfile, source: 'supabase-direct' };
    }

    // 3. Mock fallback for local UI preview
    const cached = window.localStorage.getItem('nexora_mock_profile');
    if (cached) {
      return { profile: JSON.parse(cached), source: 'local-demo-cache' };
    }

    return {
      profile: {
        id: this.currentUser?.id || 'demo-user-1234',
        display_name: this.currentUser?.email?.split('@')[0] || 'Nexora Explorer',
        avatar_url: '',
        bio: 'Fictional humanoid robotics enthusiast.',
        gender: 'unspecified',
        hobbies: ['Robotics', 'AI', 'Autonomous Systems'],
        strengths: ['Rapid Prototyping', 'Precision Engineering'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      source: 'local-demo-cache',
    };
  }

  /**
   * Update profile using Backend API (or direct Supabase update)
   */
  async updateProfile(updates) {
    const token = this.currentSession?.access_token;
    const apiUrl = window.NEXORA_CONFIG.API_BASE_URL;

    // 1. Primary: Shared Backend REST API
    if (token) {
      try {
        const response = await fetch(`${apiUrl}/v1/profile/me`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            return { profile: result.data, source: 'backend-api' };
          }
        } else {
          const errRes = await response.json().catch(() => ({}));
          throw new Error(errRes.error || `Backend responded with HTTP ${response.status}`);
        }
      } catch (backendErr) {
        console.warn('Backend API request error, attempting direct Supabase update:', backendErr.message);
      }
    }

    // 2. Direct Supabase Update
    if (this.client && this.currentUser) {
      const { data, error } = await this.client
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }

      return { profile: data, source: 'supabase-direct' };
    }

    // 3. Mock fallback for offline demonstration
    const current = (await this.getProfile()).profile;
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    window.localStorage.setItem('nexora_mock_profile', JSON.stringify(updated));
    return { profile: updated, source: 'local-demo-cache' };
  }

  /**
   * Upload Avatar to Supabase Storage
   */
  async uploadAvatar(file) {
    if (!this.client || !this.currentUser) {
      throw new Error('Please configure Supabase and sign in to upload avatars.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${this.currentUser.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await this.client.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.client.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Fetch PostgreSQL Trigger Audit Logs
   */
  async getAuditLogs() {
    const token = this.currentSession?.access_token;
    const apiUrl = window.NEXORA_CONFIG.API_BASE_URL;

    if (token) {
      try {
        const response = await fetch(`${apiUrl}/v1/profile/me/audit-logs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) return result.data;
        }
      } catch (e) {
        // ignore
      }
    }

    if (this.client && this.currentUser) {
      const { data } = await this.client
        .from('profile_audit_logs')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('performed_at', { ascending: false })
        .limit(5);
      return data || [];
    }

    return [];
  }

  // --- Internal Demo Mocks ---
  _mockSignUp(email, password, displayName) {
    const mockUser = {
      id: 'demo-' + Math.random().toString(36).substring(2, 9),
      email,
      user_metadata: { display_name: displayName || email.split('@')[0] },
    };
    const mockSession = {
      access_token: 'mock-jwt-token-demo',
      user: mockUser,
    };
    window.localStorage.setItem('nexora_mock_session', JSON.stringify(mockSession));
    this.currentSession = mockSession;
    this.currentUser = mockUser;
    return { user: mockUser, session: mockSession };
  }

  _mockSignIn(email, password) {
    return this._mockSignUp(email, password, email.split('@')[0]);
  }
}

window.nexoraAuth = new NexoraAuthService();

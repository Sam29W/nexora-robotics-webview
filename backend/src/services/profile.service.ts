import { supabaseAdmin } from '../lib/supabase';
import { UpdateProfileInput } from '../validators/profile.validator';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  gender: string;
  hobbies: string[];
  strengths: string[];
  created_at: string;
  updated_at: string;
}

export class ProfileService {
  /**
   * Retrieve profile for the given user ID.
   * If profile does not exist, initialize a default row to prevent 404s.
   */
  static async getProfile(userId: string, fallbackEmail?: string): Promise<UserProfile> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error retrieving profile: ${error.message}`);
    }

    if (data) {
      return data as UserProfile;
    }

    // Auto-create initial profile row if not present
    const defaultName = fallbackEmail ? fallbackEmail.split('@')[0] : 'Nexora Pioneer';
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        display_name: defaultName,
        bio: 'Robotics Explorer and Nexora Pioneer.',
        gender: 'unspecified',
        hobbies: ['Robotics', 'AI', 'Autonomous Systems'],
        strengths: ['Curiosity', 'Innovation'],
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to initialize profile: ${insertError.message}`);
    }

    return newProfile as UserProfile;
  }

  /**
   * Update profile fields. The database trigger updates 'updated_at' automatically.
   */
  static async updateProfile(userId: string, updates: UpdateProfileInput): Promise<UserProfile> {
    // Ensure profile row exists first
    await this.getProfile(userId);

    const updatePayload: Record<string, any> = {};
    if (updates.display_name !== undefined) updatePayload.display_name = updates.display_name;
    if (updates.avatar_url !== undefined) updatePayload.avatar_url = updates.avatar_url;
    if (updates.bio !== undefined) updatePayload.bio = updates.bio;
    if (updates.gender !== undefined) updatePayload.gender = updates.gender;
    if (updates.hobbies !== undefined) updatePayload.hobbies = updates.hobbies;
    if (updates.strengths !== undefined) updatePayload.strengths = updates.strengths;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error updating profile: ${error.message}`);
    }

    return data as UserProfile;
  }

  /**
   * Retrieve recent audit logs for the user's profile updates.
   */
  static async getAuditLogs(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })
      .limit(10);

    if (error) {
      // In case audit table is not yet migrated, fail gracefully
      console.warn('Audit logs query warning:', error.message);
      return [];
    }

    return data || [];
  }
}

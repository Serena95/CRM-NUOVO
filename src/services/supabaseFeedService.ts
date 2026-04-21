import { supabase } from '@/lib/supabase';
import { FeedPost, FeedComment, FeedReaction } from '@/types/feed';

export const supabaseFeedService = {
  async createPost(post: Omit<FeedPost, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('feed_posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePost(id: string, updates: Partial<FeedPost>) {
    const { data, error } = await supabase
      .from('feed_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(id: string) {
    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addComment(comment: Omit<FeedComment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('feed_comments')
      .insert([comment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(id: string) {
    const { error } = await supabase
      .from('feed_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleReaction(postId: string, userId: string, emoji: string) {
    // Check if reaction exists
    const { data: existing } = await supabase
      .from('feed_reactions')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Remove
      await supabase
        .from('feed_reactions')
        .delete()
        .eq('id', existing.id);
    } else {
      // Add
      await supabase
        .from('feed_reactions')
        .insert([{ post_id: postId, user_id: userId, emoji }]);
    }
  },

  subscribeToPosts(callback: (posts: FeedPost[]) => void) {
    // Initial fetch
    this.getPosts().then(callback);

    // Subscribe to changes
    return supabase
      .channel('feed_posts_changes')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'feed_posts' }, async () => {
        const posts = await this.getPosts();
        callback(posts);
      })
      .subscribe();
  },

  async getPosts() {
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        reactions:feed_reactions(*)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FeedPost[];
  }
};

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    username: string;
    display_name?: string;
  };
  receiver_profile?: {
    username: string;
    display_name?: string;
  };
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_profile: {
    username: string;
    display_name?: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
}

// Hook to get user's friends
export function useFriends() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          created_at,
          friend_profile:profiles!friends_friend_id_fkey (
            username,
            display_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Friend[];
    },
    enabled: !!user,
  });
}

// Hook to get sent friend requests
export function useSentFriendRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friend-requests', 'sent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          message,
          created_at,
          updated_at,
          receiver_profile:profiles!friend_requests_receiver_id_fkey (
            username,
            display_name
          )
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FriendRequest[];
    },
    enabled: !!user,
  });
}

// Hook to get received friend requests
export function useReceivedFriendRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friend-requests', 'received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          message,
          created_at,
          updated_at,
          sender_profile:profiles!friend_requests_sender_id_fkey (
            username,
            display_name
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FriendRequest[];
    },
    enabled: !!user,
  });
}

// Hook to search users by username
export function useSearchUsers(searchTerm: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['search-users', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
}

// Hook to send friend request
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: string; message?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'sent', user?.id] });
    },
  });
}

// Hook to respond to friend request (accept/reject)
export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'received', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });
}

// Hook to cancel sent friend request
export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'sent', user?.id] });
    },
  });
}

// Hook to remove friend
export function useRemoveFriend() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });
}

// Hook to get friend's tasting notes
export function useFriendTastingNotes(friendId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friend-notes', friendId],
    queryFn: async () => {
      if (!user || !friendId) return [];
      
      // First check if they are friends
      const { data: friendship, error: friendshipError } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();

      if (friendshipError || !friendship) {
        throw new Error('Not friends with this user');
      }

      // Get friend's notes
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', friendId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!friendId,
  });
}
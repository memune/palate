// Debug script for feed issues
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFeed() {
  console.log('🔍 Starting feed debugging...\n');

  // 1. Check if we can connect and get current user
  console.log('1. Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }
  console.log('✅ User authenticated:', user?.id);

  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  // 2. Check if user has a profile
  console.log('\n2. Checking user profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile error:', profileError);
  } else {
    console.log('✅ Profile found:', profile);
  }

  // 3. Check tasting notes count
  console.log('\n3. Checking user\'s tasting notes...');
  const { data: userNotes, error: userNotesError } = await supabase
    .from('tasting_notes')
    .select('id, title, ratings, created_at')
    .eq('user_id', user.id);

  if (userNotesError) {
    console.error('❌ User notes error:', userNotesError);
  } else {
    console.log(`✅ Found ${userNotes?.length || 0} user notes:`, userNotes);
  }

  // 4. Check friends
  console.log('\n4. Checking friends...');
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', user.id);

  if (friendsError) {
    console.error('❌ Friends error:', friendsError);
  } else {
    console.log(`✅ Found ${friends?.length || 0} friends:`, friends);
  }

  // 5. Check friends' notes
  if (friends && friends.length > 0) {
    console.log('\n5. Checking friends\' notes...');
    const friendIds = friends.map(f => f.friend_id);
    
    const { data: friendsNotes, error: friendsNotesError } = await supabase
      .from('tasting_notes')
      .select('id, title, ratings, created_at, user_id')
      .in('user_id', friendIds);

    if (friendsNotesError) {
      console.error('❌ Friends notes error:', friendsNotesError);
    } else {
      console.log(`✅ Found ${friendsNotes?.length || 0} friends notes:`, friendsNotes);
    }
  }

  // 6. Test the exact feed query
  console.log('\n6. Testing feed query...');
  const friendIds = friends?.map(f => f.friend_id) || [];
  const allUserIds = [user.id, ...friendIds];

  console.log('User IDs for feed:', allUserIds);

  const { data: feedData, error: feedError } = await supabase
    .from('tasting_notes')
    .select(`
      *,
      user_profile:profiles(username, display_name)
    `)
    .in('user_id', allUserIds)
    .not('ratings', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (feedError) {
    console.error('❌ Feed query error:', feedError);
  } else {
    console.log(`✅ Feed query returned ${feedData?.length || 0} notes:`, feedData);
  }

  // 7. Check RLS policies
  console.log('\n7. Checking RLS policies...');
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('policyname, cmd, qual')
    .eq('tablename', 'tasting_notes');

  if (policiesError) {
    console.error('❌ Policies error:', policiesError);
  } else {
    console.log('✅ RLS Policies:', policies);
  }

  console.log('\n🎯 Debug complete!');
}

debugFeed().catch(console.error);
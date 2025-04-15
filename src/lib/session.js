import { supabase } from './supabase/client';

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return error ? null : data.session;
};

export const onAuthChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
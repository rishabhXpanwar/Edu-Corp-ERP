import { useSelector } from 'react-redux';

const useAuth = () => {
  // auth slice added by COMP-01 — returns null-safe defaults until then
  const auth = useSelector((state) => state.auth);
  return {
    user:            auth?.user            ?? null,
    isAuthenticated: auth?.isAuthenticated ?? false,
    loading:         auth?.loading         ?? false,
  };
};

export default useAuth;
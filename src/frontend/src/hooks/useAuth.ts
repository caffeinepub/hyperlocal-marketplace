import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useGetCallerUserProfile } from './useQueries';

export function useAuth() {
  const { identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const profileQuery = useGetCallerUserProfile();

  return {
    identity,
    isAuthenticated,
    userProfile: profileQuery.data,
    profileLoading: actorFetching || profileQuery.isLoading,
    isFetched: !!actor && profileQuery.isFetched,
    loginStatus,
  };
}

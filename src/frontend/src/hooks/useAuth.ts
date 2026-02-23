import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '../backend';

export function useAuth() {
  const { identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    identity,
    isAuthenticated,
    userProfile: profileQuery.data,
    profileLoading: actorFetching || profileQuery.isLoading,
    isFetched: !!actor && profileQuery.isFetched,
    loginStatus,
  };
}

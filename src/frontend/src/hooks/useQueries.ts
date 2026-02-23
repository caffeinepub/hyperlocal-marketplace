import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Product,
  Shop,
  Order,
  Cart,
  ProductInput,
  Category,
  OrderStatus,
  SupportTicket,
  TicketStatus,
  PlatformStats,
  UserProfile,
} from '../backend';
import { AppRole } from '../backend';

// Products
export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetProductsByLocation(location: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'location', location],
    queryFn: async () => {
      if (!actor || !location) return [];
      return actor.getProductsByLocation(location);
    },
    enabled: !!actor && !isFetching && !!location,
  });
}

// Shops
export function useGetShops() {
  const { actor, isFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetShopsByLocation(location: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['shops', 'location', location],
    queryFn: async () => {
      if (!actor || !location) return [];
      return actor.getShopsByLocation(location);
    },
    enabled: !!actor && !isFetching && !!location,
  });
}

// Cart
export function useGetCart() {
  const { actor, isFetching } = useActor();

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCartItem(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkout();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Orders
export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestReturn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: bigint; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestReturn(orderId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Shopkeeper
export function useRegisterShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerShop(name, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useToggleShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleShopStatus(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, product }: { productId: string; product: ProductInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGetShopOrders(shopId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', 'shop', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      return actor.getShopOrders(shopId);
    },
    enabled: !!actor && !isFetching && !!shopId,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Admin
export function useGetPlatformStats() {
  const { actor, isFetching } = useActor();

  return useQuery<PlatformStats>({
    queryKey: ['platformStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['platformStats'] });
    },
  });
}

// Tickets
export function useCreateSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSupportTicket(issue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useGetAllTickets() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportTicket[]>({
    queryKey: ['tickets', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateTicketStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: bigint; status: TicketStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTicketStatus(ticketId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// User Profile
export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type ShopId = string;
export interface ProductInput {
    shopId: ShopId;
    name: string;
    description: string;
    quantity: bigint;
    category: Category;
    image: ExternalBlob;
    price: number;
}
export interface Product {
    id: ProductId;
    shopId: ShopId;
    name: string;
    description: string;
    quantity: bigint;
    category: Category;
    image: ExternalBlob;
    price: number;
}
export type Time = bigint;
export interface UserProfile {
    shopId?: ShopId;
    appRole: AppRole;
    name: string;
    location?: string;
}
export type OrderId = bigint;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    total: number;
    shopId: ShopId;
    customer: Principal;
    platformCommission: number;
    timestamp: Time;
    items: Cart;
}
export type SupportTicketId = bigint;
export type Cart = Array<CartItem>;
export type ProductId = string;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface Shop {
    id: ShopId;
    owner: Principal;
    name: string;
    isOpen: boolean;
    approved: boolean;
    location: string;
}
export interface PlatformStats {
    totalCommissions: number;
    totalOrders: bigint;
    totalSales: number;
    totalShops: bigint;
    pendingTickets: bigint;
}
export interface SupportTicket {
    id: SupportTicketId;
    status: TicketStatus;
    customer: Principal;
    shopkeeper?: Principal;
    timestamp: Time;
    issue: string;
}
export enum AppRole {
    admin = "admin",
    customer = "customer",
    shopkeeper = "shopkeeper"
}
export enum Category {
    healthBeauty = "healthBeauty",
    grocery = "grocery",
    sportsOutdoors = "sportsOutdoors",
    fashion = "fashion",
    homeGarden = "homeGarden",
    electronics = "electronics"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum TicketStatus {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: ProductInput): Promise<ProductId>;
    addToCart(productId: ProductId, quantity: bigint): Promise<boolean>;
    approveShop(shopId: ShopId): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(): Promise<OrderId>;
    createSupportTicket(issue: string): Promise<SupportTicketId>;
    deleteProduct(productId: ProductId): Promise<boolean>;
    getAllTickets(): Promise<Array<SupportTicket>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getMyOrders(): Promise<Array<Order>>;
    getPlatformStats(): Promise<PlatformStats>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getProductsByLocation(location: string): Promise<Array<Product>>;
    getShopOrders(shopId: ShopId): Promise<Array<Order>>;
    getShops(): Promise<Array<Shop>>;
    getShopsByLocation(location: string): Promise<Array<Shop>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerShop(name: string, location: string): Promise<ShopId>;
    requestReturn(orderId: OrderId, reason: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleShopStatus(shopId: ShopId): Promise<boolean>;
    updateCartItem(productId: ProductId, quantity: bigint): Promise<boolean>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<boolean>;
    updateProduct(productId: ProductId, product: ProductInput): Promise<boolean>;
    updateTicketStatus(ticketId: SupportTicketId, status: TicketStatus): Promise<boolean>;
}

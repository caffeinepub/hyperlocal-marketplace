import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";
import Int32 "mo:core/Int32";
import Blob "mo:core/Blob";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let products = Map.empty<ProductId, Product>();
  let shops = Map.empty<ShopId, Shop>();
  let orders = Map.empty<OrderId, Order>();
  let supportTickets = Map.empty<SupportTicketId, SupportTicket>();
  let returnRequests = Map.empty<Nat, ReturnRequest>();

  var orderIdCounter : Nat = 0;
  var ticketIdCounter : Nat = 0;
  var returnIdCounter : Nat = 0;

  let storage = Map.empty<Text, Storage.ExternalBlob>();
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Text;
  public type ShopId = Text;
  public type OrderId = Nat;
  public type SupportTicketId = Nat;

  // Application-specific role mapping
  public type AppRole = {
    #customer;
    #shopkeeper;
    #admin;
  };

  public type UserProfile = {
    name : Text;
    appRole : AppRole;
    location : ?Text;
    shopId : ?ShopId;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Float;
    category : Category;
    shopId : ShopId;
    image : Storage.ExternalBlob;
    quantity : Nat;
  };

  public type Category = {
    #grocery;
    #electronics;
    #fashion;
    #homeGarden;
    #healthBeauty;
    #sportsOutdoors;
  };

  public type Shop = {
    id : ShopId;
    name : Text;
    location : Text;
    isOpen : Bool;
    owner : Principal;
    approved : Bool;
  };

  public type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  public type Cart = [CartItem];

  public type Order = {
    id : OrderId;
    customer : Principal;
    shopId : ShopId;
    items : Cart;
    total : Float;
    platformCommission : Float;
    status : OrderStatus;
    timestamp : Time.Time;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type SupportTicket = {
    id : SupportTicketId;
    customer : Principal;
    shopkeeper : ?Principal;
    issue : Text;
    status : TicketStatus;
    timestamp : Time.Time;
  };

  public type TicketStatus = {
    #open;
    #inProgress;
    #resolved;
    #closed;
  };

  public type ReturnRequest = {
    id : Nat;
    orderId : OrderId;
    customer : Principal;
    reason : Text;
    status : ReturnStatus;
    timestamp : Time.Time;
  };

  public type ReturnStatus = {
    #pending;
    #approved;
    #rejected;
    #completed;
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    quantity : Nat;
    shopId : ShopId;
    image : Storage.ExternalBlob;
    category : Category;
  };

  public type PlatformStats = {
    totalSales : Float;
    totalCommissions : Float;
    totalShops : Nat;
    totalOrders : Nat;
    pendingTickets : Nat;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper functions for role checking
  func isCustomer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#customer) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isShopkeeper(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#shopkeeper) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isAppAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or
    (switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#admin) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    });
  };

  func ownsShop(caller : Principal, shopId : ShopId) : Bool {
    switch (shops.get(shopId)) {
      case (?shop) {
        shop.owner == caller
      };
      case (null) { false };
    };
  };

  func shopIsApproved(shopId : ShopId) : Bool {
    switch (shops.get(shopId)) {
      case (?shop) { shop.approved };
      case (null) { false };
    };
  };

  func ownsProduct(caller : Principal, productId : ProductId) : Bool {
    switch (products.get(productId)) {
      case (?product) { ownsShop(caller, product.shopId) };
      case (null) { false };
    };
  };

  func ownsOrder(caller : Principal, orderId : OrderId) : Bool {
    switch (orders.get(orderId)) {
      case (?order) { order.customer == caller };
      case (null) { false };
    };
  };

  func shopOwnsOrder(caller : Principal, orderId : OrderId) : Bool {
    switch (orders.get(orderId)) {
      case (?order) { ownsShop(caller, order.shopId) };
      case (null) { false };
    };
  };

  // Customer Shopping Cart
  let userCarts = Map.empty<Principal, Cart>();

  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to cart");
    };
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can add to cart");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?p) { p };
    };

    if (product.quantity < quantity) {
      Runtime.trap("Not enough quantity available");
    };

    let cart : List.List<CartItem> = switch (userCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { List.fromArray(items) };
    };

    var itemExists = false;
    let updatedCart = cart.map<CartItem, CartItem>(
      func(item) {
        if (item.productId == productId) {
          itemExists := true;
          { productId; quantity = item.quantity + quantity };
        } else {
          item;
        };
      }
    );

    let finalCart = if (not itemExists) {
      updatedCart.add({ productId; quantity });
      updatedCart;
    } else {
      updatedCart;
    };

    userCarts.add(caller, finalCart.toArray());
    true;
  };

  public shared ({ caller }) func updateCartItem(productId : ProductId, quantity : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update cart");
    };
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can update cart");
    };

    let cart : List.List<CartItem> = switch (userCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { List.fromArray(items) };
    };

    let updatedCart = cart.filter(
      func(item) {
        item.productId != productId;
      }
    );

    if (quantity > 0) {
      updatedCart.add({ productId; quantity });
    };

    userCarts.add(caller, updatedCart.toArray());
    true;
  };

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view cart");
    };
    switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func checkout() : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can checkout");
    };
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can checkout");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) {
        if (c.size() == 0) {
          Runtime.trap("Cart is empty");
        };
        c;
      };
    };

    var shopId : ?ShopId = null;
    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?p) { p };
      };

      if (product.quantity < item.quantity) {
        Runtime.trap("Not enough quantity for product " # item.productId);
      };

      switch (shopId) {
        case (null) { shopId := ?product.shopId };
        case (?sid) {
          if (sid != product.shopId) {
            Runtime.trap("All items must be from the same shop");
          };
        };
      };

      let updatedProduct = {
        id = product.id;
        name = product.name;
        description = product.description;
        price = product.price;
        category = product.category;
        shopId = product.shopId;
        image = product.image;
        quantity = product.quantity - item.quantity;
      };

      products.add(product.id, updatedProduct);
    };

    let total = calculateTotal(cart);
    let commission = total * 0.02;
    let finalTotal = total + commission;

    orderIdCounter += 1;
    let orderId = orderIdCounter;

    let newOrder = {
      id = orderId;
      customer = caller;
      shopId = switch (shopId) { case (?sid) { sid }; case (null) { Runtime.trap("No shop found") } };
      items = cart;
      total = finalTotal;
      platformCommission = commission;
      status = #pending;
      timestamp = Time.now();
    };

    orders.add(orderId, newOrder);
    userCarts.add(caller, []);
    orderId;
  };

  func calculateTotal(cart : Cart) : Float {
    var total : Float = 0.0;

    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?p) { p };
      };

      total += product.price * item.quantity.toFloat();
    };

    total;
  };

  // Customer Order Management
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can view their orders");
    };

    let orderList = List.empty<Order>();
    for ((id, order) in orders.entries()) {
      if (order.customer == caller) {
        orderList.add(order);
      };
    };
    orderList.toArray();
  };

  public shared ({ caller }) func requestReturn(orderId : OrderId, reason : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request returns");
    };
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can request returns");
    };
    if (not ownsOrder(caller, orderId)) {
      Runtime.trap("Unauthorized: You can only request returns for your own orders");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    switch (order.status) {
      case (#delivered) {};
      case (_) { Runtime.trap("Can only request return for delivered orders") };
    };

    returnIdCounter += 1;
    let returnId = returnIdCounter;
    let returnRequest = {
      id = returnId;
      orderId = orderId;
      customer = caller;
      reason = reason;
      status = #pending;
      timestamp = Time.now();
    };

    returnRequests.add(returnId, returnRequest);
    returnId;
  };

  // Product Management (Shopkeeper)
  public shared ({ caller }) func addProduct(product : ProductInput) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add products");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can add products");
    };
    if (not ownsShop(caller, product.shopId)) {
      Runtime.trap("Unauthorized: You can only add products to your own shop");
    };
    let shop = switch (shops.get(product.shopId)) {
      case (null) { Runtime.trap("Shop does not exist") };
      case (?s) { s };
    };

    if (not shop.approved) {
      Runtime.trap("Shop must be approved before adding products");
    };

    let productId = generateProductId(product.name);
    let storageProduct : Product = {
      id = productId;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      shopId = product.shopId;
      image = product.image;
      quantity = product.quantity;
    };

    products.add(productId, storageProduct);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, product : ProductInput) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can update products");
    };
    if (not ownsProduct(caller, productId)) {
      Runtime.trap("Unauthorized: You can only update your own products");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (not shopIsApproved(existingProduct.shopId)) {
      Runtime.trap("Shop must be approved to update products");
    };

    let updatedProduct : Product = {
      id = productId;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      shopId = product.shopId;
      image = product.image;
      quantity = product.quantity;
    };

    products.add(productId, updatedProduct);
    true;
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can delete products");
    };
    if (not ownsProduct(caller, productId)) {
      Runtime.trap("Unauthorized: You can only delete your own products");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (not shopIsApproved(existingProduct.shopId)) {
      Runtime.trap("Shop must be approved to delete products");
    };

    products.remove(productId);
    true;
  };

  func generateProductId(name : Text) : ProductId {
    let randomComponent = Time.now().toText();
    let chars = name.toArray();
    let firstThreeChars = if (chars.size() >= 3) {
      chars.sliceToArray(0, 3);
    } else {
      chars;
    };
    randomComponent # ".prod." # Text.fromArray(firstThreeChars);
  };

  // Shop Management (Shopkeeper)
  public shared ({ caller }) func registerShop(name : Text, location : Text) : async ShopId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register shops");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can register shops");
    };

    let shopId = generateShopId(name);
    let shop : Shop = {
      id = shopId;
      name = name;
      location = location;
      isOpen = false;
      owner = caller;
      approved = false;
    };

    shops.add(shopId, shop);
    shopId;
  };

  public shared ({ caller }) func toggleShopStatus(shopId : ShopId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle shop status");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can toggle shop status");
    };
    if (not ownsShop(caller, shopId)) {
      Runtime.trap("Unauthorized: You can only toggle your own shop status");
    };

    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?s) { s };
    };

    if (not shop.approved) {
      Runtime.trap("Shop must be approved before changing status");
    };

    let updatedShop = {
      id = shop.id;
      name = shop.name;
      location = shop.location;
      isOpen = not shop.isOpen;
      owner = shop.owner;
      approved = shop.approved;
    };

    shops.add(shopId, updatedShop);
    true;
  };

  func generateShopId(name : Text) : ShopId {
    let randomComponent = Time.now().toText();
    let chars = name.toArray();
    let firstThreeChars = if (chars.size() >= 3) {
      chars.sliceToArray(0, 3);
    } else {
      chars;
    };
    randomComponent # ".shop." # Text.fromArray(firstThreeChars);
  };

  // Shopkeeper Order Management
  public query ({ caller }) func getShopOrders(shopId : ShopId) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shop orders");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can view shop orders");
    };
    if (not ownsShop(caller, shopId)) {
      Runtime.trap("Unauthorized: You can only view orders for your own shop");
    };

    let orderList = List.empty<Order>();
    for ((id, order) in orders.entries()) {
      if (order.shopId == shopId) {
        orderList.add(order);
      };
    };
    orderList.toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update order status");
    };
    if (not isShopkeeper(caller)) {
      Runtime.trap("Unauthorized: Only shopkeepers can update order status");
    };
    if (not shopOwnsOrder(caller, orderId)) {
      Runtime.trap("Unauthorized: You can only update orders for your own shop");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    if (not shopIsApproved(order.shopId)) {
      Runtime.trap("Shop must be approved to update orders");
    };

    let updatedOrder = {
      id = order.id;
      customer = order.customer;
      shopId = order.shopId;
      items = order.items;
      total = order.total;
      platformCommission = order.platformCommission;
      status = status;
      timestamp = order.timestamp;
    };

    orders.add(orderId, updatedOrder);
    true;
  };

  // Admin Functions
  public shared ({ caller }) func approveShop(shopId : ShopId) : async Bool {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can approve shops");
    };

    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?s) { s };
    };

    let updatedShop = {
      id = shop.id;
      name = shop.name;
      location = shop.location;
      isOpen = shop.isOpen;
      owner = shop.owner;
      approved = true;
    };

    shops.add(shopId, updatedShop);
    true;
  };

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view platform stats");
    };

    var totalSales : Float = 0.0;
    var totalCommissions : Float = 0.0;
    var totalOrders : Nat = 0;

    for ((id, order) in orders.entries()) {
      totalSales += order.total;
      totalCommissions += order.platformCommission;
      totalOrders += 1;
    };

    var totalShops : Nat = 0;
    for ((id, shop) in shops.entries()) {
      totalShops += 1;
    };

    var pendingTickets : Nat = 0;
    for ((id, ticket) in supportTickets.entries()) {
      switch (ticket.status) {
        case (#open) { pendingTickets += 1 };
        case (#inProgress) { pendingTickets += 1 };
        case (_) {};
      };
    };

    {
      totalSales = totalSales;
      totalCommissions = totalCommissions;
      totalShops = totalShops;
      totalOrders = totalOrders;
      pendingTickets = pendingTickets;
    };
  };

  public shared ({ caller }) func createSupportTicket(issue : Text) : async SupportTicketId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create support tickets");
    };

    ticketIdCounter += 1;
    let ticketId = ticketIdCounter;

    let ticket : SupportTicket = {
      id = ticketId;
      customer = caller;
      shopkeeper = null;
      issue = issue;
      status = #open;
      timestamp = Time.now();
    };

    supportTickets.add(ticketId, ticket);
    ticketId;
  };

  public shared ({ caller }) func updateTicketStatus(ticketId : SupportTicketId, status : TicketStatus) : async Bool {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update ticket status");
    };

    let ticket = switch (supportTickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?t) { t };
    };

    let updatedTicket = {
      id = ticket.id;
      customer = ticket.customer;
      shopkeeper = ticket.shopkeeper;
      issue = ticket.issue;
      status = status;
      timestamp = ticket.timestamp;
    };

    supportTickets.add(ticketId, updatedTicket);
    true;
  };

  public query ({ caller }) func getAllTickets() : async [SupportTicket] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all tickets");
    };

    let ticketList = List.empty<SupportTicket>();
    for ((id, ticket) in supportTickets.entries()) {
      ticketList.add(ticket);
    };
    ticketList.toArray();
  };

  // Public Query Functions (No auth required for browsing)
  public query func getProducts() : async [Product] {
    let productList = List.empty<Product>();
    for ((id, product) in products.entries()) {
      productList.add(product);
    };
    productList.toArray();
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    let productList = List.empty<Product>();
    for ((id, product) in products.entries()) {
      switch (product.category) {
        case (cat) {
          if (cat == category) {
            productList.add(product);
          };
        };
      };
    };
    productList.toArray();
  };

  public query func getProductsByLocation(location : Text) : async [Product] {
    let productList = List.empty<Product>();
    for ((id, product) in products.entries()) {
      switch (shops.get(product.shopId)) {
        case (?shop) {
          if (shop.location == location and shop.isOpen and shop.approved) {
            productList.add(product);
          };
        };
        case (null) {};
      };
    };
    productList.toArray();
  };

  public query func getShops() : async [Shop] {
    let shopList = List.empty<Shop>();
    for ((id, shop) in shops.entries()) {
      shopList.add(shop);
    };
    shopList.toArray();
  };

  public query func getShopsByLocation(location : Text) : async [Shop] {
    let shopList = List.empty<Shop>();
    for ((id, shop) in shops.entries()) {
      if (shop.location == location and shop.approved) {
        shopList.add(shop);
      };
    };
    shopList.toArray();
  };
};

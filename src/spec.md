# Specification

## Summary
**Goal:** Build a hyperlocal marketplace platform with three role-based portals (Customer, Shopkeeper, Admin) enabling local shop discovery, product ordering, inventory management, and platform administration.

**Planned changes:**
- Implement Internet Identity authentication with three user roles: Customer, Shopkeeper, and Admin
- Create Customer portal with city/area-based shop filtering, category-based product search (Grocery, Electronics, Fashion, Home & Garden, Health & Beauty, Sports & Outdoors), Quick-Add shopping cart, checkout with 2% platform commission calculation, order history with status tracking, and return/exchange request functionality
- Build Shopkeeper portal with online/offline status toggle, inventory management with product photo uploads, order management dashboard with status updates (Pending → Confirmed → Preparing → Ready for Pickup → Completed), and digital ledger showing sales history with 2% commission breakdown
- Develop Admin dashboard with platform statistics overview, shop approval system for new registrations, shop performance metrics viewing, transaction analytics tracking sales and ₹25/year subscription renewals, support ticket system for dispute resolution, and global settings panel for platform configuration
- Design mobile-first responsive UI using Trust-Blue and Success-Green color palette across all portals
- Store all data in Motoko backend with no external databases

**User-visible outcome:** Users can register with Internet Identity and access role-specific portals: Customers browse nearby shops by location, search products by category, add items to cart, place orders, and track order status; Shopkeepers manage their online presence, maintain inventory with photos, process orders, and view earnings ledger; Admins approve shops, monitor platform analytics, resolve disputes via tickets, and configure platform settings.

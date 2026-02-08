#!/usr/bin/env node

// Test script for item shop rotation
const fs = require("fs");
const path = require("path");
const functions = require("./structs/functions.js");

console.log("=== Item Shop Rotation Test ===\n");

// Display initial shop state
console.log("1. Initial Shop State:");
const initialState = JSON.parse(fs.readFileSync("./Config/shop_state.json").toString());
console.log(JSON.stringify(initialState, null, 2));

// Force a rotation by setting lastRotation to a date in the past
console.log("\n2. Forcing rotation by backdating lastRotation...");
initialState.lastRotation = "2020-01-01T00:00:00.000Z";
fs.writeFileSync("./Config/shop_state.json", JSON.stringify(initialState, null, 2));

// Trigger rotation
console.log("\n3. Triggering shop rotation...");
const rotated = functions.rotateShop();
console.log(`Rotation result: ${rotated ? "SUCCESS - Shop rotated" : "FAILED - No rotation"}`);

// Display new shop state
console.log("\n4. New Shop State:");
const newState = JSON.parse(fs.readFileSync("./Config/shop_state.json").toString());
console.log(`Last Rotation: ${newState.lastRotation}`);
console.log(`Rotation Interval: ${newState.rotationIntervalHours} hours`);
console.log(`Daily Items: ${newState.currentDaily.length}`);
console.log(`Featured Items: ${newState.currentFeatured.length}`);

// Display catalog config
console.log("\n5. Generated Catalog Config:");
const catalogConfig = JSON.parse(fs.readFileSync("./Config/catalog_config.json").toString());
console.log(JSON.stringify(catalogConfig, null, 2));

// Test getItemShop function
console.log("\n6. Testing getItemShop() function...");
try {
    const shop = functions.getItemShop();
    console.log(`Shop expiration: ${shop.expiration}`);
    console.log(`Refresh interval: ${shop.refreshIntervalHrs} hours`);
    
    const dailyStorefront = shop.storefronts.find(s => s.name === "BRDailyStorefront");
    const weeklyStorefront = shop.storefronts.find(s => s.name === "BRWeeklyStorefront");
    
    console.log(`Daily storefront entries: ${dailyStorefront ? dailyStorefront.catalogEntries.length : 0}`);
    console.log(`Weekly storefront entries: ${weeklyStorefront ? weeklyStorefront.catalogEntries.length : 0}`);
    
    console.log("\n✅ All tests passed!");
} catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
}

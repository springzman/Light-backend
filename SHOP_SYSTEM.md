# Automatic Item Shop System

## Overview

LawinServerV2 now includes an automatic item shop rotation system designed for Fortnite version 12.41 (Chapter 2 Season 2). The system automatically rotates shop items at configurable intervals and exposes the current shop via the existing storefront API.

## Features

- **Automatic Rotation**: Shop items rotate automatically based on a configurable time interval (default: 24 hours)
- **Persistent State**: Shop state is saved to disk and survives server restarts
- **Configurable Items Pool**: Large pool of cosmetic items appropriate for v12.41
- **Real-time Updates**: Connected clients are notified when the shop rotates
- **Seamless Integration**: Works with existing purchase and gift systems

## Configuration

### Rotation Interval

Edit `Config/config.json` to customize the rotation interval:

```json
{
  "itemShop": {
    "rotationIntervalHours": 24
  }
}
```

Default is 24 hours. Change this value to any number of hours you prefer.

### Shop Items Pool

The available items are defined in `Config/shop_items.json`. This file contains:
- **Daily Items**: Lower rarity items (uncommon/rare) that appear in the daily section
- **Featured Items**: Higher rarity items (epic/legendary) that appear in the featured section

Each item has:
- `name`: Display name of the item
- `itemGrants`: Array of item template IDs to grant
- `price`: Price in V-Bucks
- `rarity`: Rarity level (for reference)

You can add or remove items from this pool as needed.

## How It Works

### Shop Rotation Logic

1. **On Server Start**: The system initializes and performs a rotation check
2. **Periodic Checks**: Every hour, the system checks if rotation is needed
3. **Rotation Trigger**: If the time since last rotation exceeds the configured interval, rotation occurs
4. **Item Selection**: 
   - 6 random daily items are selected from the daily pool
   - 2 random featured items are selected from the featured pool
5. **State Update**: The new shop state is saved to `Config/shop_state.json`
6. **Catalog Update**: The catalog config is updated with the selected items
7. **Client Notification**: All connected clients receive a shop update notification

### Files Involved

- `Config/shop_items.json` - Pool of available items
- `Config/shop_state.json` - Current shop state (last rotation time, current items)
- `Config/catalog_config.json` - Generated catalog configuration (updated on rotation)
- `structs/functions.js` - Core rotation logic and shop generation
- `index.js` - Rotation scheduling

## API Endpoints

The shop is exposed via the existing endpoint:

### Get Current Shop
```
GET /fortnite/api/storefront/v2/catalog
```

Returns the current item shop catalog with:
- Shop expiration time
- Available daily items
- Available featured items
- Prices and item grants for each offer

### Check Gift Eligibility
```
GET /fortnite/api/storefront/v2/gift/check_eligibility/recipient/:recipientId/offer/:offerId
```

Check if an item can be gifted to a specific player.

## Manual Shop Rotation

While the shop rotates automatically, you can also trigger a manual rotation by:

1. Editing `Config/shop_state.json` and setting `lastRotation` to a date in the past
2. Restarting the server or waiting for the next hourly check

## Shop State File

`Config/shop_state.json` contains:
```json
{
  "lastRotation": "2026-02-08T16:48:22.870Z",
  "rotationIntervalHours": 24,
  "currentDaily": [...],
  "currentFeatured": [...]
}
```

- `lastRotation`: Timestamp of the last rotation
- `rotationIntervalHours`: Current rotation interval (synced from config)
- `currentDaily`: Array of currently selected daily items
- `currentFeatured`: Array of currently selected featured items

## Testing

Test scripts are included to verify the shop system:

```bash
# Test rotation logic
node test_shop_rotation.js

# Test API response
node test_shop_api.js

# Test rotation timing
node test_rotation_timing.js
```

## Integration with Purchase System

The shop system integrates seamlessly with the existing purchase flow:

1. Client queries `/fortnite/api/storefront/v2/catalog` to see available items
2. Client sends purchase request with offer ID to `/fortnite/api/game/v2/profile/*/client/PurchaseCatalogEntry`
3. Server validates the offer ID against current shop items
4. If valid and affordable, items are granted to the player's profile

## Troubleshooting

### Shop Not Rotating

1. Check `Config/shop_state.json` - verify `lastRotation` timestamp
2. Check server logs for "Item shop has been rotated with new items" message
3. Verify `rotationIntervalHours` in config.json is set correctly
4. Ensure the server has write permissions to Config directory

### No Items in Shop

1. Verify `Config/shop_items.json` exists and contains items
2. Check that items have valid `itemGrants` arrays
3. Review server logs for any errors during rotation

### Items Not Appearing in Launcher

1. Ensure launcher is connecting to the correct backend URL
2. Check that launcher is making requests to `/fortnite/api/storefront/v2/catalog`
3. Verify the response includes `storefronts` with `catalogEntries`

## Season Storefront

In addition to daily and featured items, the shop includes a permanent "Season Storefront" with special items defined in `responses/catalog.json`. These items do not rotate and are always available.

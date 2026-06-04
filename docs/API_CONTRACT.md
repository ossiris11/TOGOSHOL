# TOGOSHOL API Contract Draft

This is the first backend contract draft for parallel frontend/backend work.

## Base URL

```text
/api
```

## Products

### GET `/api/products`

Returns all available PC builds.

Response:

```json
{
  "items": [
    {
      "id": "vk-13706696",
      "title": "Ryzen 5 5500 / RTX 3070 8GB",
      "price": 62900,
      "priceText": "62 900 ₽",
      "status": "available",
      "image": "https://...",
      "specs": {
        "cpu": "Ryzen 5 5500",
        "gpu": "RTX 3070 8GB",
        "ram": "16GB DDR4",
        "storage": "SSD 512GB",
        "psu": "650W"
      },
      "source": {
        "type": "vk",
        "url": "https://vk.com/market/product/-214535058_13706696"
      }
    }
  ]
}
```

### GET `/api/products/:id`

Returns one product by ID.

## Requests

### POST `/api/requests`

Creates a customer request from the configurator or product card.

Request:

```json
{
  "name": "Client name",
  "contact": "@telegram_or_phone",
  "source": "configurator",
  "budget": 120000,
  "game": "Counter-Strike 2",
  "resolution": "1440p",
  "partsCondition": "Не важно",
  "ram": "32GB",
  "storage": "1TB",
  "message": "Optional comment",
  "productId": "vk-13706696"
}
```

Response:

```json
{
  "ok": true,
  "requestId": "req_001"
}
```

## Notes

- Frontend currently uses static `src/data/vkProducts.ts`.
- Backend can later replace that with `GET /api/products`.
- Do not store VK tokens in frontend code.

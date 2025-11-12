# DANA Payment Gateway Integration Guide

## Overview
Integrasi payment gateway menggunakan DANA Dashboard API (dashboard.dana.id) untuk menerima pembayaran dari aplikasi MDZ BloxBux.

## Konfigurasi Environment Variables

Tambahkan ke file `.env`:

```env
# DANA Payment Gateway
DANA_MERCHANT_ID="your-dana-merchant-id"
DANA_SECRET_KEY="your-dana-secret-key"
DANA_BASE_URL="https://dashboard.dana.id"
```

## API Endpoints

### 1. Create Payment
**Endpoint:** `POST /api/payment/create`

**Request Body:**
```json
{
  "orderId": 123,
  "paymentMethod": "DANA"
}
```

**Response:**
```json
{
  "message": "Payment created successfully",
  "payment": {
    "paymentId": "dana-payment-id",
    "paymentUrl": "https://checkout.dana.id/...",
    "orderId": "MDZ-123-timestamp"
  }
}
```

### 2. Payment Callback
**Endpoint:** `POST /api/payment/callback`

**Request Body (dari DANA):**
```json
{
  "orderId": "MDZ-123-timestamp",
  "paymentId": "dana-payment-id",
  "status": "SUCCESS",
  "amount": 50000,
  "signature": "hmac-signature"
}
```

### 3. Check Payment Status
**Endpoint:** `GET /api/payment/callback?orderId=123`

**Response:**
```json
{
  "paymentStatus": "SUCCESS",
  "orderStatus": "COMPLETED",
  "paymentId": "dana-payment-id"
}
```

## Flow Integrasi

1. **User Buat Order** → Sistem buat order di database
2. **Pilih Payment Method** → User pilih DANA di modal
3. **Create Payment** → API call ke DANA untuk buat hosted checkout
4. **Redirect ke DANA** → User diarahkan ke halaman payment DANA
5. **User Bayar** → User complete payment di DANA
6. **Callback dari DANA** → DANA kirim notification ke `/api/payment/callback`
7. **Update Status** → Sistem update order status otomatis
8. **Telegram Notification** → Admin dapat notifikasi

## Payment Methods yang Didukung

- `DANA` - Pembayaran via aplikasi DANA
- `BANK_TRANSFER` - Transfer bank
- `EWALLET` - E-wallet lainnya

## Signature Verification

Untuk production, pastikan verifikasi signature:

```javascript
const crypto = require('crypto')
const expectedSignature = crypto.createHmac('sha256', DANA_SECRET_KEY)
  .update(`${orderId}${paymentId}${status}${amount}${DANA_SECRET_KEY}`)
  .digest('hex')
```

## Testing

1. **Sandbox Environment**: Gunakan `DANA_BASE_URL` yang berbeda untuk testing
2. **Mock Payments**: Test dengan amount kecil
3. **Callback Testing**: Pastikan callback URL dapat diakses dari internet

## Error Handling

- **Invalid Signature**: Return 400 Bad Request
- **Order Not Found**: Return 404 Not Found
- **Payment Failed**: Update status ke FAILED
- **Network Error**: Retry mechanism atau manual check

## Monitoring

- **Logs**: Monitor console logs untuk debugging
- **Database**: Check payment status di tabel orders
- **Telegram**: Notifikasi real-time untuk admin

## Production Checklist

- [ ] Environment variables sudah di-set dengan benar
- [ ] Callback URL dapat diakses dari internet
- [ ] Signature verification aktif
- [ ] SSL certificate valid
- [ ] Rate limiting untuk API endpoints
- [ ] Error logging ke external service
- [ ] Backup dan recovery plan

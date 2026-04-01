<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - {{ $transaction->receipt_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            width: {{ ($paperSize ?? 'mm_80') === 'mm_58' ? '58mm' : '80mm' }};
            margin: 0 auto;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .header .logo {
            max-width: 60px;
            max-height: 40px;
            margin-bottom: 5px;
        }
        .header h1 {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 10px;
        }
        .info {
            margin-bottom: 15px;
        }
        .info p {
            margin-bottom: 2px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            padding: 3px 0;
            text-align: left;
        }
        th {
            border-bottom: 1px dashed #000;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
        }
        .totals .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        .totals .row.total {
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            white-space: pre-line;
        }
    </style>
</head>
<body>
    <div class="header">
        @if($shop->logo_path)
        <img src="{{ public_path('storage/' . $shop->logo_path) }}" alt="Logo" class="logo" />
        @endif
        <h1>{{ $shop->shop_name ?? 'TOKO ATK' }}</h1>
        @if($shop->address)
        <p>{{ $shop->address }}</p>
        @endif
        @if($shop->phone)
        <p>{{ $shop->phone }}</p>
        @endif
    </div>

    <div class="info">
        <p><strong>No:</strong> {{ $transaction->receipt_number }}</p>
        <p><strong>Kasir:</strong> {{ $transaction->user->name }}</p>
        <p><strong>Tanggal:</strong> {{ $transaction->created_at->format('d/m/Y H:i:s') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Sub</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transaction->items as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->price_sell, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals text-right">
        <div class="row">
            <span>Subtotal:</span>
            <span>Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</span>
        </div>
        @if($transaction->discount_amount > 0)
        <div class="row">
            <span>Diskon:</span>
            <span>- Rp {{ number_format($transaction->discount_amount, 0, ',', '.') }}</span>
        </div>
        @endif
        <div class="row">
            <span>PPN ({{ $shop->tax_rate ?? 11 }}%):</span>
            <span>Rp {{ number_format($transaction->tax_amount, 0, ',', '.') }}</span>
        </div>
        <div class="row total">
            <span>TOTAL:</span>
            <span>Rp {{ number_format($transaction->total_price, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="totals text-right">
        <div class="row">
            <span>Bayar:</span>
            <span>Rp {{ number_format($transaction->amount_paid, 0, ',', '.') }}</span>
        </div>
        <div class="row">
            <span>Kembalian:</span>
            <span>Rp {{ number_format($transaction->change_amount, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="footer">
        {!! $shop->receipt_footer ? e($shop->receipt_footer) : 'Terima kasih atas<br>kunjungan Anda!' !!}
    </div>
</body>
</html>
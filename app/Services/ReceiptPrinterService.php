<?php

namespace App\Services;

use App\Models\ShopSetting;
use App\Models\Transaction;
use Exception;
use Illuminate\Support\Facades\Log;
use Mike42\Escpos\PrintConnectors\DummyPrintConnector;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class ReceiptPrinterService
{
    /**
     * Get the printer connector based on configuration.
     *
     * @return mixed
     * @throws Exception
     */
    protected function getConnector()
    {
        $type = config('printer.default');
        $config = config("printer.connections.{$type}");

        switch ($type) {
            case 'network':
                return new NetworkPrintConnector($config['ip'], $config['port']);
            case 'windows':
                return new WindowsPrintConnector($config['path']);
            case 'file':
                return new FilePrintConnector($config['path']);
            case 'dummy':
                return new DummyPrintConnector();
            default:
                throw new Exception("Unsupported printer connection type: {$type}");
        }
    }

    /**
     * Print the transaction receipt.
     *
     * @param Transaction $transaction
     * @return bool
     */
    public function printTransaction(Transaction $transaction): bool
    {
        try {
            $connector = $this->getConnector();
            $printer = new Printer($connector);
            $shop = ShopSetting::first();

            // Header
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            if ($shop && $shop->name) {
                $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH | Printer::MODE_DOUBLE_HEIGHT);
                $printer->text($shop->name . "\n");
                $printer->selectPrintMode(); // Reset
            }

            if ($shop && $shop->address) {
                $printer->text($shop->address . "\n");
            }
            if ($shop && $shop->phone) {
                $printer->text("Telp: " . $shop->phone . "\n");
            }
            $printer->text(str_repeat("-", 32) . "\n");

            // Transaction Info
            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $printer->text("No: " . $transaction->receipt_number . "\n");
            $printer->text("Tgl: " . $transaction->transaction_date->format('d/m/Y H:i') . "\n");
            $printer->text("Kasir: " . $transaction->user->name . "\n");
            $printer->text(str_repeat("-", 32) . "\n");

            // Items
            foreach ($transaction->items as $item) {
                $name = $item->product_name;
                $qty = $item->quantity . "x";
                $price = number_format($item->unit_price, 0, ',', '.');
                $subtotal = number_format($item->total_price, 0, ',', '.');

                // Format: Name (New Line if long)
                // Qty x Price          Subtotal
                $printer->text($name . "\n");
                $printer->text(str_pad($qty . " " . $price, 20) . str_pad($subtotal, 12, " ", STR_PAD_LEFT) . "\n");
            }
            $printer->text(str_repeat("-", 32) . "\n");

            // Totals
            $printer->setJustification(Printer::JUSTIFY_RIGHT);
            $printer->text("Subtotal: " . number_format($transaction->subtotal, 0, ',', '.') . "\n");
            if ($transaction->tax_amount > 0) {
                $printer->text("Pajak: " . number_format($transaction->tax_amount, 0, ',', '.') . "\n");
            }
            if ($transaction->discount_amount > 0) {
                $printer->text("Diskon: -" . number_format($transaction->discount_amount, 0, ',', '.') . "\n");
            }

            $printer->selectPrintMode(Printer::MODE_BOLD);
            $printer->text("TOTAL: " . number_format($transaction->total_price, 0, ',', '.') . "\n");
            $printer->selectPrintMode();

            $printer->text("Bayar: " . number_format($transaction->amount_paid, 0, ',', '.') . "\n");
            $printer->text("Kembali: " . number_format($transaction->change_amount, 0, ',', '.') . "\n");
            $printer->text(str_repeat("-", 32) . "\n");

            // Footer
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            if ($shop && $shop->receipt_footer) {
                $printer->text($shop->receipt_footer . "\n");
            } else {
                $printer->text("Terima Kasih\nAtas Kunjungan Anda\n");
            }

            $printer->feed(2);
            $printer->cut();
            $printer->pulse(); // Open cash drawer
            $printer->close();

            return true;
        } catch (Exception $e) {
            Log::error("Printer Error: " . $e->getMessage());
            return false;
        }
    }
}

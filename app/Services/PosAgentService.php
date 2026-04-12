<?php

namespace App\Services;

use Prism\Prism\Enums\Provider;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Facades\Tool;
use Prism\Prism\ValueObjects\Messages\AssistantMessage;
use Prism\Prism\ValueObjects\Messages\UserMessage;

class PosAgentService
{
    private array $conversationHistory = [];

    private string $systemPrompt;

    private BusinessDataService $businessData;

    public function __construct()
    {
        $this->businessData = new BusinessDataService;

        $this->systemPrompt = <<<'PROMPT'
You are POS Agent, a helpful AI assistant for a Point-of-Sale (POS) system.

AVAILABLE TOOLS:
You have access to these tools to get real business data from the database. ALWAYS use the appropriate tool when the user asks about:
- Sales data (today, this week, this month, custom period)
- Product performance (top selling, low stock, available products with sales)
- Category performance
- Expenses and profit/loss

AVAILABLE FUNCTIONS:
1. getTodaySales() - Returns today's total transactions, revenue, and items sold
2. getTopProducts(limit) - Returns top selling products (default: 5)
3. getLowStockProducts() - Returns products with stock below minimum
4. getSalesByPeriod(days) - Returns sales data for last N days (default: 7)
5. getCategorySales() - Returns sales breakdown by product category
6. getExpensesByPeriod(days) - Returns expenses for last N days (default: 30)
7. getProfitLoss(days) - Returns profit/loss for last N days (default: 30)
8. getAvailableProductsWithSales(period) - Returns all available products with their sales data
   - period can be: "today", "week" (default), "month"
   - Returns: all products with stock > 0, which ones are selling, which are not

IMPORTANT:
- When user asks about sales, products, stock, expenses, or profits ALWAYS use the appropriate tool
- When user asks "produk apa yang dijual dan tersedia & laris" use getAvailableProductsWithSales
- Format numbers in Indonesian format (use period for thousands separator)
- Provide insights and recommendations based on the data
- If user asks about data that requires tools, call the tool first, then explain the results
- Be concise but informative

RESPONSE STYLE:
- Always respond in Indonesian
- Use Indonesian number format (contoh: 1.500.000)
- Provide actionable insights from the data
- If data shows issues (low stock, losses), provide recommendations

CONSTRAINTS:
- NEVER access user data or settings
- Only use business data: products, transactions, sales, stock, categories, expenses
PROMPT;
    }

    /**
     * @return array<int, \Prism\Prism\Tool>
     */
    private function createTools(): array
    {
        return [
            Tool::as('getTodaySales')
                ->for('Get total sales data for today including transaction count, revenue, and items sold')
                ->using(function (): string {
                    $data = $this->businessData->getTodaySales();

                    return json_encode($data);
                }),

            Tool::as('getTopProducts')
                ->for('Get top selling products in the current week')
                ->withNumberParameter('limit', 'Number of top products to return (default: 5)', false)
                ->using(function (float $limit = 5): string {
                    $data = $this->businessData->getTopProducts((int) $limit);

                    return json_encode($data);
                }),

            Tool::as('getLowStockProducts')
                ->for('Get list of products with stock below minimum threshold')
                ->using(function (): string {
                    $data = $this->businessData->getLowStockProducts();

                    return json_encode($data);
                }),

            Tool::as('getSalesByPeriod')
                ->for('Get sales data for a specific period')
                ->withNumberParameter('days', 'Number of days to look back (default: 7)', false)
                ->using(function (float $days = 7): string {
                    $data = $this->businessData->getSalesByPeriod((int) $days);

                    return json_encode($data);
                }),

            Tool::as('getCategorySales')
                ->for('Get sales breakdown by product category for current month')
                ->using(function (): string {
                    $data = $this->businessData->getCategorySales();

                    return json_encode($data);
                }),

            Tool::as('getExpensesByPeriod')
                ->for('Get expenses data for a specific period')
                ->withNumberParameter('days', 'Number of days to look back (default: 30)', false)
                ->using(function (float $days = 30): string {
                    $data = $this->businessData->getExpensesByPeriod((int) $days);

                    return json_encode($data);
                }),

            Tool::as('getProfitLoss')
                ->for('Calculate profit and loss for a specific period')
                ->withNumberParameter('days', 'Number of days to look back (default: 30)', false)
                ->using(function (float $days = 30): string {
                    $data = $this->businessData->getProfitLoss((int) $days);

                    return json_encode($data);
                }),

            Tool::as('getAvailableProductsWithSales')
                ->for('Get all available products (stock > 0) with their sales data. Use this when user asks about products that are selling and available.')
                ->withStringParameter('period', 'Time period: "today", "week" (default), or "month"', false)
                ->using(function (string $period = 'week'): string {
                    $data = $this->businessData->getAvailableProductsWithSales($period);

                    return json_encode($data);
                }),
        ];
    }

    public function sendMessage(string $message): string
    {
        $this->conversationHistory[] = new UserMessage($message);

        $response = Prism::text()
            ->using(Provider::Gemini, 'gemini-2.5-flash')
            ->withSystemPrompt($this->systemPrompt)
            ->withMessages($this->conversationHistory)
            ->withTools($this->createTools())
            ->withMaxSteps(5)
            ->asText();

        $this->conversationHistory[] = new AssistantMessage($response->text);

        return $response->text;
    }

    public function resetConversation(): void
    {
        $this->conversationHistory = [];
    }
}

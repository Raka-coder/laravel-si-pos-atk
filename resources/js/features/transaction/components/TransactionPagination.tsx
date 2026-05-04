import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import type { Paginated } from '@/types';

interface TransactionPaginationProps {
    transactions: Paginated<unknown>;
    getPaginationLink: (page: number) => string;
}

export function TransactionPagination({
    transactions,
    getPaginationLink,
}: TransactionPaginationProps) {
    if (transactions.last_page <= 1) {
        return null;
    }

    const pages = Array.from(
        { length: transactions.last_page },
        (_, i) => i + 1,
    );

    const visiblePages = pages.filter(
        (page) =>
            page === 1 ||
            page === transactions.last_page ||
            Math.abs(page - transactions.current_page) <= 2,
    );

    let lastShownPage = 0;

    return (
        <div className="mt-4">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={
                                transactions.current_page > 1
                                    ? getPaginationLink(
                                          transactions.current_page - 1,
                                      )
                                    : undefined
                            }
                            className={
                                transactions.current_page <= 1
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>

                    {visiblePages.map((page) => {
                        const showEllipsis =
                            lastShownPage > 0 && page > lastShownPage + 1;
                        lastShownPage = page;

                        return (
                            <PaginationItem key={page}>
                                {showEllipsis ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href={getPaginationLink(page)}
                                        isActive={
                                            page === transactions.current_page
                                        }
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href={
                                transactions.current_page <
                                transactions.last_page
                                    ? getPaginationLink(
                                          transactions.current_page + 1,
                                      )
                                    : undefined
                            }
                            className={
                                transactions.current_page >=
                                transactions.last_page
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

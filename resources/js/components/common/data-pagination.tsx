import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total?: number;
}

interface DataPaginationProps {
    meta: PaginationMeta;
    getPaginationLink: (page: number) => string;
}

export function DataPagination({
    meta,
    getPaginationLink,
}: DataPaginationProps) {
    if (meta.last_page <= 1) {
        return null;
    }

    const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);
    const visiblePages = pages.filter(
        (page) =>
            page === 1 ||
            page === meta.last_page ||
            Math.abs(page - meta.current_page) <= 2,
    );

    return (
        <div className="mt-4">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={
                                meta.current_page > 1
                                    ? getPaginationLink(meta.current_page - 1)
                                    : undefined
                            }
                            className={
                                meta.current_page <= 1
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>

                    {visiblePages.map((page, index, array) => (
                        <PaginationItem key={page}>
                            {index > 0 && page - array[index - 1] > 1 ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href={getPaginationLink(page)}
                                    isActive={page === meta.current_page}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href={
                                meta.current_page < meta.last_page
                                    ? getPaginationLink(meta.current_page + 1)
                                    : undefined
                            }
                            className={
                                meta.current_page >= meta.last_page
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

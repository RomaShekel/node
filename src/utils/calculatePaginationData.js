// src/utils/calculatePaginationData.js

export const calculatePaginationData = (count, page, perPage) => {
    const totalPage = Math.ceil(count/perPage);
    const hasNextPage = Boolean(totalPage - page);
    const hasPreviousPage = page !== 1;

    return {
        page,
        perPage,
        totalItem: count,
        totalPage,
        hasNextPage,
        hasPreviousPage
    }
}
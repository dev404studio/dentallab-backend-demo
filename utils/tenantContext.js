/**
 * tenantContext.js
 * Dùng AsyncLocalStorage để truyền tenantId xuyên suốt request lifecycle
 * mà không cần truyền tay qua từng function/controller.
 */
const { AsyncLocalStorage } = require("async_hooks");

const tenantStorage = new AsyncLocalStorage();

/**
 * Lấy tenantId từ context hiện tại (nếu có).
 * @returns {string|undefined}
 */
const getTenantId = () => tenantStorage.getStore()?.tenantId;

/**
 * Chạy callback fn trong context của tenantId.
 * Tất cả async operations bên trong fn đều thấy cùng tenantId.
 * @param {string} tenantId
 * @param {Function} fn
 */
const runWithTenant = (tenantId, fn) =>
    tenantStorage.run({ tenantId }, fn);

module.exports = { getTenantId, runWithTenant };

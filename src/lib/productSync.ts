export const productDataChangedEvent = 'togoshol:product-data-changed';
export const productDataStorageKey = 'togoshol-product-data-version';

export function notifyProductDataChanged() {
  window.dispatchEvent(new Event(productDataChangedEvent));
  try {
    window.localStorage.setItem(productDataStorageKey, String(Date.now()));
  } catch {
    // Same-tab updates still work when storage is unavailable.
  }
}

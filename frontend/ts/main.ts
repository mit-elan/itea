/**
 * main.ts – Wird auf allen Seiten geladen.
 * Zuständig für: Navigation rendern, Session-Check, Cart-Widget
 * Sprint 1: Implementierung
 */

// Basis-URL zum Backend
const API_BASE = '../backend/serviceHandler.php';

/** Hilfsfunktion für AJAX-GET */
function apiGet(handler: string, method: string, params: Record<string,string> = {}): Promise<any> {
    const query = new URLSearchParams({ handler, method, ...params }).toString();
    return fetch(`${API_BASE}?${query}`).then(r => r.json());
}

/** Hilfsfunktion für AJAX-POST */
function apiPost(handler: string, method: string, body: object): Promise<any> {
    const form = new FormData();
    form.append('handler', handler);
    form.append('method', method);
    Object.entries(body).forEach(([k, v]) => form.append(k, String(v)));
    return fetch(API_BASE, { method: 'POST', body: form }).then(r => r.json());
}

// TODO Sprint 1: renderNav(), updateCartWidget()

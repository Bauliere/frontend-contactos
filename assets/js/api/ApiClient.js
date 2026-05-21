export class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    async get(path) {
        return this.request(path);
    }

    async post(path, body) {
        return this.request(path, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put(path, body) {
        return this.request(path, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete(path) {
        return this.request(path, { method: 'DELETE' });
    }

    async request(path, options = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.error || 'No se pudo completar la solicitud.');
        }

        return payload;
    }
}

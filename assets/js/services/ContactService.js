export class ContactService {
    constructor(api) {
        this.api = api;
    }

    async getCategories() {
        const response = await this.api.get('/categorias');
        return response.data || [];
    }

    async createCategory(payload) {
        const response = await this.api.post('/categorias', {
            nombre_categoria: payload.nombre_categoria,
            descripcion: payload.descripcion || null,
            color_categoria: payload.color_categoria,
        });

        const created = Array.isArray(response.data) ? response.data[0] : response.data;
        return Number(created?.id_categoria);
    }

    async getContacts() {
        const response = await this.api.get('/contactos');
        return this.groupContacts(response.data || []);
    }

    async createContact(payload) {
        const response = await this.api.post('/contactos', {
            nombre: payload.nombre,
            apellido: payload.apellido,
            fecha_nacimiento: payload.fecha_nacimiento || null,
            id_categoria: Number(payload.id_categoria),
        });

        const created = Array.isArray(response.data) ? response.data[0] : response.data;
        const contactId = Number(created?.id_contacto);

        await this.syncData(contactId, [], payload);
        return contactId;
    }

    async updateContact(contact, payload) {
        await this.api.put(`/contactos/${contact.id_contacto}`, {
            nombre: payload.nombre,
            apellido: payload.apellido,
            fecha_nacimiento: payload.fecha_nacimiento || null,
            id_categoria: Number(payload.id_categoria),
        });

        await this.syncData(contact.id_contacto, contact.datos, payload);
        return contact.id_contacto;
    }

    async deleteContact(contactId) {
        return this.api.delete(`/contactos/${contactId}`);
    }

    async syncData(contactId, currentData, payload) {
        const items = [
            { type: 'Telefono', value: payload.telefono, primary: true },
            { type: 'Correo', value: payload.correo, primary: false },
            { type: 'Direccion', value: payload.direccion, primary: false },
        ];

        for (const item of items) {
            await this.syncSingleData(contactId, currentData, item);
        }
    }

    async syncSingleData(contactId, currentData, item) {
        const existing = currentData.find((data) => data.tipo_dato === item.type);
        const value = String(item.value || '').trim();

        if (value && existing) {
            await this.api.put(`/datos-contacto/${existing.id_dato}`, {
                id_contacto: contactId,
                tipo_dato: item.type,
                valor: value,
                es_principal: item.primary,
            });
            return;
        }

        if (value && !existing) {
            await this.api.post('/datos-contacto', {
                id_contacto: contactId,
                tipo_dato: item.type,
                valor: value,
                es_principal: item.primary,
            });
            return;
        }

        if (!value && existing) {
            await this.api.delete(`/datos-contacto/${existing.id_dato}`);
        }
    }

    groupContacts(rows) {
        const contacts = new Map();

        rows.forEach((row) => {
            const id = Number(row.id_contacto);
            if (!contacts.has(id)) {
                contacts.set(id, {
                    id_contacto: id,
                    nombre: row.nombre,
                    apellido: row.apellido,
                    fecha_nacimiento: row.fecha_nacimiento,
                    fecha_registro: row.fecha_registro,
                    id_categoria: Number(row.id_categoria),
                    nombre_categoria: row.nombre_categoria,
                    color_categoria: row.color_categoria || '#29df9c',
                    datos: [],
                });
            }

            if (row.id_dato) {
                contacts.get(id).datos.push({
                    id_dato: Number(row.id_dato),
                    tipo_dato: row.tipo_dato,
                    valor: row.valor,
                    es_principal: Boolean(Number(row.es_principal)),
                });
            }
        });

        return [...contacts.values()].sort((a, b) => b.id_contacto - a.id_contacto);
    }
}

export class ContactTable {
    constructor(tableBody) {
        this.tableBody = tableBody;
        this.onEdit = null;
        this.onDelete = null;

        this.tableBody.addEventListener('click', (event) => this.handleClick(event));
    }

    render(contacts) {
        if (!contacts.length) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">No hay contactos para mostrar.</td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = contacts.map((contact) => `
            <tr>
                <td>${contact.id_contacto}</td>
                <td>
                    <div class="fw-bold">${this.escape(contact.nombre)} ${this.escape(contact.apellido)}</div>
                    <small class="text-secondary">${this.escape(contact.fecha_nacimiento || 'Sin fecha de nacimiento')}</small>
                </td>
                <td>
                    <span class="badge-category" style="--category-color: ${this.escape(contact.color_categoria)}">
                        ${this.escape(contact.nombre_categoria || 'Sin categoria')}
                    </span>
                </td>
                <td>
                    <div class="data-stack">
                        ${this.renderData(contact.datos)}
                    </div>
                </td>
                <td class="text-secondary">${this.escape(contact.fecha_registro || '')}</td>
                <td>
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-outline-info action-button" type="button" data-action="edit" data-id="${contact.id_contacto}" aria-label="Actualizar contacto">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-outline-danger action-button" type="button" data-action="delete" data-id="${contact.id_contacto}" aria-label="Eliminar contacto">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderData(dataRows) {
        if (!dataRows.length) {
            return '<span class="data-chip">Sin datos</span>';
        }

        return dataRows.map((data) => `
            <span class="data-chip">
                <strong>${this.displayType(data.tipo_dato)}</strong>
                ${this.escape(data.valor)}
            </span>
        `).join('');
    }

    handleClick(event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const id = Number(button.dataset.id);
        if (button.dataset.action === 'edit' && this.onEdit) {
            this.onEdit(id);
        }
        if (button.dataset.action === 'delete' && this.onDelete) {
            this.onDelete(id);
        }
    }

    displayType(type) {
        return {
            Telefono: 'Telefono',
            Correo: 'Correo',
            Direccion: 'Direccion',
        }[type] || type;
    }

    escape(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
}

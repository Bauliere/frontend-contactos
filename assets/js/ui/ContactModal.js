export class ContactModal {
    constructor(element, form) {
        this.element = element;
        this.form = form;
        this.modal = new bootstrap.Modal(element);
        this.mode = 'create';
        this.currentContact = null;
        this.onSubmit = null;

        this.fields = {
            id: document.querySelector('#contactId'),
            title: document.querySelector('#contactModalTitle'),
            name: document.querySelector('#contactName'),
            lastname: document.querySelector('#contactLastname'),
            birthdate: document.querySelector('#contactBirthdate'),
            category: document.querySelector('#contactCategory'),
            phone: document.querySelector('#contactPhone'),
            email: document.querySelector('#contactEmail'),
            address: document.querySelector('#contactAddress'),
        };

        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
    }

    setCategories(categories) {
        this.fields.category.innerHTML = categories.map((category) => `
            <option value="${category.id_categoria}">${this.escape(category.nombre_categoria)}</option>
        `).join('');
    }

    openCreate(categories) {
        this.mode = 'create';
        this.currentContact = null;
        this.setCategories(categories);
        this.form.reset();
        this.fields.id.value = '';
        this.fields.title.textContent = 'Agregar contacto';
        this.modal.show();
    }

    openEdit(contact, categories) {
        this.mode = 'edit';
        this.currentContact = contact;
        this.setCategories(categories);
        this.fields.id.value = contact.id_contacto;
        this.fields.title.textContent = 'Actualizar contacto';
        this.fields.name.value = contact.nombre || '';
        this.fields.lastname.value = contact.apellido || '';
        this.fields.birthdate.value = contact.fecha_nacimiento || '';
        this.fields.category.value = contact.id_categoria;
        this.fields.phone.value = this.firstDataValue(contact, 'Telefono');
        this.fields.email.value = this.firstDataValue(contact, 'Correo');
        this.fields.address.value = this.firstDataValue(contact, 'Direccion');
        this.modal.show();
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (!this.onSubmit) return;

        const payload = {
            nombre: this.fields.name.value.trim(),
            apellido: this.fields.lastname.value.trim(),
            fecha_nacimiento: this.fields.birthdate.value || null,
            id_categoria: Number(this.fields.category.value),
            telefono: this.fields.phone.value.trim(),
            correo: this.fields.email.value.trim(),
            direccion: this.fields.address.value.trim(),
        };

        await this.onSubmit({
            mode: this.mode,
            contact: this.currentContact,
            payload,
        });

        this.modal.hide();
    }

    firstDataValue(contact, type) {
        return contact.datos.find((data) => data.tipo_dato === type)?.valor || '';
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

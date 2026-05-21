import { ApiClient } from './api/ApiClient.js';
import { ContactService } from './services/ContactService.js';
import { ContactTable } from './ui/ContactTable.js';
import { ContactModal } from './ui/ContactModal.js';
import { CategoryModal } from './ui/CategoryModal.js';
import { DeleteModal } from './ui/DeleteModal.js';
import { FeedbackModal } from './ui/FeedbackModal.js';
import { API_BASE } from './config.js';

export class App {
    constructor() {
        this.themes = ['forest', 'neon-mint', 'neon-cyan', 'neon-violet', 'neon-pink', 'neon-lime', 'neon-amber'];
        this.api = new ApiClient(API_BASE);
        this.service = new ContactService(this.api);
        this.contacts = [];
        this.categories = [];
        this.search = '';
        this.categoryFilter = 'all';

        this.table = new ContactTable(document.querySelector('#contactsTableBody'));
        this.contactModal = new ContactModal(
            document.querySelector('#contactModal'),
            document.querySelector('#contactForm'),
        );
        this.categoryModal = new CategoryModal(
            document.querySelector('#categoryModal'),
            document.querySelector('#categoryForm'),
        );
        this.deleteModal = new DeleteModal(
            document.querySelector('#deleteModal'),
            document.querySelector('#confirmDeleteButton'),
        );
        this.feedbackModal = new FeedbackModal(document.querySelector('#feedbackModal'));
    }

    async start() {
        this.setTheme(localStorage.getItem('agenda-theme') || 'forest');
        document.querySelector('#apiBaseLabel').textContent = API_BASE;
        this.bindEvents();
        await this.load();
    }

    bindEvents() {
        document.querySelector('#addContactButton').addEventListener('click', () => {
            this.contactModal.openCreate(this.categories);
        });

        document.querySelector('#addCategoryButton').addEventListener('click', () => {
            this.categoryModal.open();
        });

        document.querySelectorAll('[data-theme-choice]').forEach((button) => {
            button.addEventListener('click', () => this.setTheme(button.dataset.themeChoice));
        });

        document.querySelector('#refreshButton').addEventListener('click', () => this.load());

        document.querySelector('#searchInput').addEventListener('input', (event) => {
            this.search = event.target.value.trim().toLowerCase();
            this.render();
        });

        document.querySelector('#categoryFilter').addEventListener('change', (event) => {
            this.categoryFilter = event.target.value;
            this.render();
        });

        this.table.onEdit = (id) => {
            const contact = this.findContact(id);
            if (contact) this.contactModal.openEdit(contact, this.categories);
        };

        this.table.onDelete = (id) => {
            const contact = this.findContact(id);
            if (contact) this.deleteModal.open(contact);
        };

        this.contactModal.onSubmit = (event) => this.saveContact(event);
        this.categoryModal.onSubmit = (payload) => this.saveCategory(payload);
        this.deleteModal.onConfirm = (contact) => this.deleteContact(contact);
    }

    async load() {
        try {
            const [categories, contacts] = await Promise.all([
                this.service.getCategories(),
                this.service.getContacts(),
            ]);

            this.categories = categories;
            this.contacts = contacts;
            this.renderCategoryFilter();
            this.render();
        } catch (error) {
            this.feedbackModal.show('Error de conexion', error.message);
        }
    }

    async saveContact({ mode, contact, payload }) {
        try {
            if (mode === 'create') {
                await this.service.createContact(payload);
                await this.load();
                this.feedbackModal.show('Registro agregado', 'El contacto fue creado correctamente.');
                return;
            }

            await this.service.updateContact(contact, payload);
            await this.load();
            this.feedbackModal.show('Registro actualizado', 'El contacto fue actualizado correctamente.');
        } catch (error) {
            this.feedbackModal.show('No se pudo guardar', error.message);
        }
    }

    async saveCategory(payload) {
        try {
            await this.service.createCategory(payload);
            await this.load();
            this.feedbackModal.show('Categoria agregada', 'La categoria fue creada y ya esta disponible para asignarla a contactos.');
        } catch (error) {
            this.feedbackModal.show('No se pudo guardar la categoria', error.message);
        }
    }

    async deleteContact(contact) {
        try {
            await this.service.deleteContact(contact.id_contacto);
            await this.load();
            this.feedbackModal.show('Registro eliminado', 'El contacto fue eliminado correctamente.');
        } catch (error) {
            this.feedbackModal.show('No se pudo eliminar', error.message);
        }
    }

    render() {
        this.table.render(this.filteredContacts());
    }

    renderCategoryFilter() {
        const select = document.querySelector('#categoryFilter');
        select.innerHTML = [
            '<option value="all">Todas</option>',
            ...this.categories.map((category) => `
                <option value="${category.id_categoria}">${this.escape(category.nombre_categoria)}</option>
            `),
        ].join('');
    }

    filteredContacts() {
        return this.contacts.filter((contact) => {
            const matchesCategory = this.categoryFilter === 'all'
                || String(contact.id_categoria) === this.categoryFilter;
            const haystack = [
                contact.nombre,
                contact.apellido,
                contact.nombre_categoria,
                contact.fecha_registro,
                ...contact.datos.flatMap((data) => [data.tipo_dato, data.valor]),
            ].join(' ').toLowerCase();

            return matchesCategory && (!this.search || haystack.includes(this.search));
        });
    }

    findContact(id) {
        return this.contacts.find((contact) => contact.id_contacto === Number(id));
    }

    setTheme(theme) {
        const selectedTheme = this.themes.includes(theme) ? theme : 'forest';
        document.documentElement.dataset.theme = selectedTheme;
        localStorage.setItem('agenda-theme', selectedTheme);
        document.querySelectorAll('[data-theme-choice]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.themeChoice === selectedTheme);
        });
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

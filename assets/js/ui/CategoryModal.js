export class CategoryModal {
    constructor(element, form) {
        this.element = element;
        this.form = form;
        this.modal = new bootstrap.Modal(element);
        this.onSubmit = null;

        this.fields = {
            name: document.querySelector('#categoryName'),
            description: document.querySelector('#categoryDescription'),
            color: document.querySelector('#categoryColor'),
            palette: document.querySelector('#categoryPalette'),
        };

        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        this.fields.color.addEventListener('input', () => this.syncPalette(this.fields.color.value));
        this.fields.palette.addEventListener('click', (event) => this.pickColor(event));
    }

    open() {
        this.form.reset();
        this.fields.color.value = '#29df9c';
        this.syncPalette(this.fields.color.value);
        this.modal.show();
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (!this.onSubmit) return;

        await this.onSubmit({
            nombre_categoria: this.fields.name.value.trim(),
            descripcion: this.fields.description.value.trim(),
            color_categoria: this.fields.color.value,
        });

        this.modal.hide();
    }

    pickColor(event) {
        const button = event.target.closest('[data-color]');
        if (!button) return;

        this.fields.color.value = button.dataset.color;
        this.syncPalette(button.dataset.color);
    }

    syncPalette(color) {
        const normalized = String(color || '').toLowerCase();
        this.fields.palette.querySelectorAll('[data-color]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.color.toLowerCase() === normalized);
        });
    }
}

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
        };

        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
    }

    open() {
        this.form.reset();
        this.fields.color.value = '#29df9c';
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
}

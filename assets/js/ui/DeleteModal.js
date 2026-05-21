export class DeleteModal {
    constructor(element, confirmButton) {
        this.element = element;
        this.confirmButton = confirmButton;
        this.message = document.querySelector('#deleteModalMessage');
        this.modal = new bootstrap.Modal(element);
        this.contact = null;
        this.onConfirm = null;

        this.confirmButton.addEventListener('click', () => this.confirm());
    }

    open(contact) {
        this.contact = contact;
        this.message.textContent = `Se eliminara a ${contact.nombre} ${contact.apellido}. Esta accion no se puede deshacer.`;
        this.modal.show();
    }

    async confirm() {
        if (!this.contact || !this.onConfirm) return;
        await this.onConfirm(this.contact);
        this.modal.hide();
    }
}

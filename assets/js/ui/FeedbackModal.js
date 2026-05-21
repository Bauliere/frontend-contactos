export class FeedbackModal {
    constructor(element) {
        this.element = element;
        this.title = document.querySelector('#feedbackModalTitle');
        this.message = document.querySelector('#feedbackModalMessage');
        this.modal = new bootstrap.Modal(element);
    }

    show(title, message) {
        this.title.textContent = title;
        this.message.textContent = message;
        this.modal.show();
    }
}

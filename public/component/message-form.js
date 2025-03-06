class MessageForm extends AbsForm {
    constructor() {
        super();
        this.setData();
				this.addEventListener('click', this.handleClick);
    }

    static get observedAttributes() { return; }

		handleClick(e) {
			e.composedPath().find((node) => 
			{
					if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
					if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
					if(node.className.match(/command-send-message/))
					{
							const form = this.querySelector('form');
							const formData = new FormData(form);
							util.sendFormData('/message/send', "POST", formData ).then((response) =>
							{
									if (100 == response.code)
									{
										return;
									}
									else
									{
                                        if (response.message) alert(response.message, true);
                                        else console.dir(response); 
									}       
							});
							return;
					}
					
			});
		}
		

    render() {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }

    setData(data) {
        if (data) {
            Object.assign(this.data, store.getInfo(this.listName, '_id', data._id));
            this.data.isNew = "update";
        } else {
					const defaultData = {
            _id: "",
            to: "",
            subject: "",
            content: "",
            isNew: "save"
					};
					Object.assign(this.data, defaultData);
        }
    }

   

    #getTemplate() {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
            <style>
                .card-header {
                    padding: 12px;
                }
                .message-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-control {
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .form-control:focus {
                    outline: none;
                    border-color: #4a90e2;
                    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
                }
                .content-area {
                    min-height: 200px;
                    resize: vertical;
                }
                .button-group {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }
                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-primary {
                    background-color: #4a90e2;
                    color: white;
                }
                .btn-secondary {
                    background-color: #f5f5f5;
                    color: #333;
                }
                .btn:hover {
                    opacity: 0.9;
                }
            </style>
            <div class="card">
                <div class="card-header">
                    <span class="fw-semibold">메시지 보내기</span>
                    <button type="button" class="btn btn-secondary command-close-modal">
                        <i class="ti ti-x fs-8"></i>
                    </button>
                </div>
                <div class="card-body">
                    <form class="message-form">
                        <div class="form-group">
                            <label for="to" class="form-label">수신인 *</label>
                            <input type="text" 
                                   class="form-control" 
                                   id="to" 
                                   name="to" 
                                   placeholder="수신인 이메일을 입력하세요"
                                   required>
                        </div>

                        <div class="form-group">
                            <label for="link" class="form-label">link *</label>
                            <input type="text" 
                                   class="form-control" 
                                   id="link" 
                                   name="link" 
                                   placeholder="메시지 제목을 입력하세요"
                                   required>
                        </div>

                        <div class="form-group">
                            <label for="content" class="form-label">내용 *</label>
                            <textarea class="form-control content-area" 
                                      id="content" 
                                      name="content" 
                                      placeholder="메시지 내용을 입력하세요"
                                      required></textarea>
                        </div>

                        <div class="button-group">
                            <button type="button" class="btn btn-secondary command-close-modal">취소</button>
                            <button type="button" class="btn btn-primary command-send-message">보내기</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        return inner_template;
    }
}

customElements.define('message-form', MessageForm); 
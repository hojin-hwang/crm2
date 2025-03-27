class BoardInfoForm extends AbsForm
{
    constructor()
    {
        super();  
        this.data = {};
        this.data.isNew = true;
        this.data.collection = 'boardInfo'
    }

    static get observedAttributes() {return; }
  
    setData(data)
    {
    }

    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }


    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">게시판 추가</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="name" class="form-label">제목</label>
                                <input type="text" class="form-control" id="name" name="name">
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
                <div class="mt-1 row-space-between command-group">
                    <button type="button" class="btn btn-primary command-save-form">save</button> 
                </div>
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('boardinfo-form', BoardInfoForm);
  
  
  
  
  
   
  
  
  
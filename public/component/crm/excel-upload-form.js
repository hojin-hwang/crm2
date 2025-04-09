class ExcelUploadForm extends AbstractComponent
{
    constructor()
    {
        super();  
        this.data = {};
    }

    static get observedAttributes() {return; }
    
    handleClick(e) {
        //e.preventDefault();
        e.composedPath().find((node)=>{
          if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
          if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
          if(node.className.match(/command-save-form/))
          {
            this.#addData()
            return;
          }
        });
    }

    setData(data)
    {
       if(data)
       {
        this.data.tag = data;
        switch(data)
        {
            case "company":
                this.data.title = '고객사';
            break;
            case "customer":
                this.data.title = '고객';
            break;
            case "product":
                this.data.title = '품목';
            break;
            default:
            break;
        }  
       }
    }

    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }

    async #addData() {
        const form = this.querySelector('form');
        const formData = new FormData(form);
        try {
            const response = await util.sendFormFileData("/excel/upload", "POST", formData);
            if (response.code === 100) {
                console.log("upload success")
                this.showAlert({type:"info",message:"데이터가 업로드 되었습니다."});
                
            } else {
                console.log("upload fail")
                const message = (response.error)? response.error : "데이터 업로드에 실패하였습니다."
                this.showAlert({type:"warning",message});
            }
            this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
        } catch (error) {
            this.showAlert({type:"danger",message:"데이터 업로드에 실패하였습니다."});
            throw new Error('업로드 실패');
        }
    }

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            input[type=file]{display:block;}
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">데이터 추가</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <div class="mb-3 row-space-between" style="align-items: flex-start;">
                            <div>
                                <label for="name" class="form-label">${this.data.title} 데이터 추가하기</label>
                                <form  method="POST" enctype="multipart/form-data">
                                    <input type="hidden" name="model" value="${this.data.tag}"> 
                                    <input type="file" name="excelFile" id="excelFile">
                                </form>
                            </div>
                            <div>
                                <a href="/uploads/excel/${this.data.tag}.xlsx" target="_blank"><span>샘플 양식 다운로드</span></a>
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
  customElements.define('excel-upload-form', ExcelUploadForm);
  
  
  
  
  
   
  
  
  
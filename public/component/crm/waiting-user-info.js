class WaitingUserInfo extends AbstractComponent
{
    constructor(data)
    {
        super(); 
        this.addEventListener('click', this.handleClick);
     }
    static get observedAttributes() {return; }
  
    handleClick(e) {
        e.preventDefault();
        e.composedPath().find((node)=>{
          if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
          if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
          if(node.className.match(/command-go-link/))
          {
            location.href = '/user/login/'+globalThis.user.clientId;
            return;
          }
        });
    }

    render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }

    setData(){
        
    }
    
    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">사용자 승인 대기중</span>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <p class="lead"> ${globalThis.user.name} 님. 지금은 대기상태입니다.</p>
                    <p class="lead"> 관리자 승인후 사용하실 수 있습니다.</p>
                    </div>
                </div>
                <div class="mt-1">
                    <button type="button" class="btn btn-primary command-go-link">로그인으로 돌아가기</button> 
                </div>

            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('waiting-user-info', WaitingUserInfo);
  
  
  
  
  
   
  
  
  
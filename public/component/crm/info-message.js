
class InfoMessage extends AbstractComponent
{
  
  constructor(info)
  {
    super();
    this.info = {}
    if(info) Object.assign(this.info, info);
    this.#initData();
    this.addEventListener('click', this.handleClick);
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-go-link/))
      {
        location.href = this.info.button.link;
        //location.href = '/user/login/'+globalThis.user.clientId;
        return;
      }
    });
}

  connectedCallback()
  {
    this.render();
    this.#showButton();
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }

  #initData()
  {
    if(this.info.button) this.info.button.visible = true;
    else
    {
      this.info.button = {
        visible:false,
        text:"Main으로 돌아가기",
        link:"/"
      };
    }
  }

  #showButton()
  {
    const button = this.querySelector('.command-go-link');
    if(this.info.button.visible) button.classList.remove('hidden');
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <div class="card">
          <div class="card-header form-header row-space-between">
            <span class="fw-semibold">${this.info.title}</span>
          </div>
          <div class="card-body">
            <p>${this.info.message}</p>
            <div class="mt-3" style="text-align:right;">
                <button type="button" class="btn btn-primary command-go-link hidden">${this.info.button.text}</button> 
            </div>
          </div>
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("info-message", InfoMessage);


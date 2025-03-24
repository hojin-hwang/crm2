class FooterBar extends AbstractComponent
{
  constructor(info)
  {
    super();
    if(info) Object.assign(this.info, info);
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-table/))
      {
        
        return;
      }
      
    });
  }


  connectedCallback()
  {
    this.render();
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }


  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <footer class="footer">
          <div class="container-fluid d-flex justify-content-between">
            <nav class="pull-left">
              
            </nav>
            <div class="copyright">
            </div>
            <div>
              Distributed by
              <a target="_blank" href="/admin">ThemeWagon</a>.
            </div>
          </div>
        </footer>
      `;  
      return tempalate;
  }
}
customElements.define("footer-bar", FooterBar);


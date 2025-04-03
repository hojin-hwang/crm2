class NavLeft extends AbstractComponent
{
  constructor()
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);
    this.addEventListener('click', this.handleClick);
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-table/))
      {
        if(!node.getAttribute('tag')) return;
        const collection = node.getAttribute('tag');
        this.#changeTableContents(collection);
        return;
      }
      if(node.className.match(/command-show-component/))
      {
        if(!node.getAttribute('tag')) return;
        this.#showTagComponent(node);
        return;
      }
    });
  }

  onMessage(event)
  {
    const window_url = window.location.hostname;
    if(event.origin.indexOf(window_url) < 0) return;
    if(event.data.msg)
    {
        switch(event.data.msg)
        {
          case "SELECT_TABLE_MENU":
            this.#changeTableContents(event.data.data);
          break;
          default:
          break;
            
        }
    }
  }

  connectedCallback()
  {
    this.render();
  }

  disconnectedCallback()
  {
    window.removeEventListener("message", this.messageListener)
    this.removeEventListener("click", this.handleClick)
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }


  #changeTableContents(collection)
  {
    const _list = new TableList(globalThis.config[collection]);
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(_list);
  }


  #showTagComponent(node)
  {
    const tagName = node.getAttribute('tag');
    const component = document.createElement(tagName);
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(component);
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <style>
          .sidebar.show{
            transform: translate3d(0, 0, 0) !important;
          }
          .sidebar-logo.show{
            display:block;
          }
          .nav-toggle.show{right: 18px!important;justify-content: right;}

        </style>
        <div class="sidebar" data-background-color="dark">
        <div class="sidebar-logo">
          <div class="logo-header" data-background-color="dark">
            <a href="/admin" class="logo">
              <img
                src="/assets/img/kaiadmin/logo_light.svg"
                alt="navbar brand"
                class="navbar-brand"
                height="20"
              />
            </a>
            <div class="nav-toggle">
              <button class="btn btn-toggle toggle-sidebar">
                <i class="gg-menu-right"></i>
              </button>
              <button class="btn btn-toggle sidenav-toggler">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="sidebar-wrapper scrollbar scrollbar-inner">
          <div class="sidebar-content">
            <ul class="nav nav-secondary ">
                <li class="nav-section">
                  <span class="sidebar-mini-icon">
                    <i class="fa fa-ellipsis-h"></i>
                  </span>
                  <h4 class="text-section">Client</h4>
                </li>
                <li class="nav-item">
                  <a href="#" class="command-show-component" tag="apply-list">
                    <i class="fas fa-calendar-check"></i>
                    <p>신청서</p>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="#" class="command-show-component" tag="client-list">
                    <i class="fas fa-calendar-check"></i>
                    <p>리스트</p>
                  </a>
                </li>

                

              <li class="nav-section">
                <span class="sidebar-mini-icon">
                  <i class="fa fa-ellipsis-h"></i>
                </span>
                <h4 class="text-section">Any thing</h4>
              </li>
            </ul>
          </div>
        </div>
      </div>
      `;  
      return tempalate;
  }
}
customElements.define("nav-left", NavLeft);


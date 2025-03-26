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
                  <a href="#" class="command-show-component" tag="client-list">
                    <i class="fas fa-calendar-check"></i>
                    <p>리스트</p>
                  </a>
                </li>

                <li class="nav-item">
                  <a href="#" class="command-show-component" tag="make-client">
                    <i class="fas fa-briefcase"></i>
                    <p>만들기</p>
                  </a>
                </li>
                <li class="nav-item hidden work">
                  <a href="#" class="command-show-table" tag="work">
                    <i class="fas fa-book"></i>
                    <p>영업일지</p>
                  </a>
                </li>

                <li class="nav-item">
                  <a data-bs-toggle="collapse" href="#base-info">
                    <i class="fas fa-layer-group"></i>
                    <p>정보관리</p>
                    <span class="caret"></span>
                  </a>
                  <div class="collapse" id="base-info">
                    <ul class="nav nav-collapse">
                      <li class="hidden company">
                        <a href="#" class="command-show-table" tag="company">
                          <span class="sub-item">고객사</span>
                        </a>
                      </li>
                      <li class="hidden customer">
                        <a href="#" class="command-show-table" tag="customer">
                          <span class="sub-item">고객</span>
                        </a>
                      </li>
                      <li class="hidden product">
                        <a href="#" class="command-show-table" tag="product">
                          <span class="sub-item">품목</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>

              <li class="nav-section">
                <span class="sidebar-mini-icon">
                  <i class="fa fa-ellipsis-h"></i>
                </span>
                <h4 class="text-section">게시판</h4>
              </li>

              <ul class="nav custom-board">
              
              </ul>

              <ul class="nav nav-collapse manage-menu">
                <li class="nav-section">
                <span class="sidebar-mini-icon">
                  <i class="fa fa-ellipsis-h"></i>
                </span>
                <h4 class="text-section">관리자</h4>
                </li>
                <li class="nav-item">
                  <a href="#" class="command-show-table" tag="user">
                    <i class="fas fa-user-plus"></i>
                    <p>사용자</p>
                    <span class="badge badge-secondary">1</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="#" class="command-show-component" tag="board-list">
                    <i class="fas fa-cog"></i>
                    <p>게시판 관리</p>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="#" class="command-show-component" tag="use-record">
                    <i class="fas fa-chart-bar"></i>
                    <p>기록</p>
                  </a>
                </li>
              </ul>
              
            </ul>
          </div>
        </div>
      </div>
      `;  
      return tempalate;
  }
}
customElements.define("nav-left", NavLeft);


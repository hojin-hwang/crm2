class NavLeft extends AbstractComponent
{
  constructor(info)
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);
    this.addEventListener('click', this.handleClick);
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
        if(!node.getAttribute('tag')) return;
        const collection = node.getAttribute('tag');
        this.#changeTableContents(collection);
        this.#foldMenuIsMobile()
        
        return;
      }
      if(node.className.match(/command-show-board/))
      {
        this.#showCustomBoard(node);
        this.#foldMenuIsMobile()
        return;
      }
      if(node.className.match(/command-show-component/))
      {
        if(!node.getAttribute('tag')) return;
        this.#showTagComponent(node);
        this.#foldMenuIsMobile()
        return;
      }
      if(node.className.match(/command-show-sheet-list/))
      {
        if(!node.getAttribute('tag')) return;
        this.#showSheetList(node);
        this.#foldMenuIsMobile()
        return;
      }
      if(node.className.match(/command-close-nav-left/))
      {
        this.#hideThisBar();
        node.classList.toggle('command-close-nav-left')
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
          case "DO_SHOW_NAV_LEFT":
            this.#showThisBar();
            this.#appendCloseCommand();
            //this.#selectContentsMenu(event.data.data)
          break;
          case "COMMAND_CHANGE_DATA":
            this.#appendCustomerBoard();
          break;
          case "GET_DATA_LIST":
            //this.#addCustomBoard(event.data.data)
          break;
          case "GET_USER_BOARD_LIST":
            //this.#removeMenu(event.data.data)
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

    this.#showBasicBoard();
    this.#appendCustomerBoard();
    if(!this.#isManager()) this.#removeManagerMenu()
    return;
  }

  #foldMenuIsMobile()
  {
    if (window.screen.width < 1024) {
      this.#hideThisBar();
      this.querySelector('.nav-toggle').classList.toggle('command-close-nav-left')
    }
  }

  #showThisBar()
  {
    this.querySelector('.sidebar').classList.add('show')
    this.querySelector('.sidebar-logo').classList.add('show')
    this.querySelector('.nav-toggle').classList.add('show')
  }

  #hideThisBar()
  {
    this.querySelector('.sidebar').classList.remove('show')
    this.querySelector('.sidebar-logo').classList.remove('show')
    this.querySelector('.nav-toggle').classList.remove('show')
  }

  #appendCloseCommand()
  {
    this.querySelector('.nav-toggle').classList.toggle('command-close-nav-left')
  }

  #isManager()
  {
      if(globalThis.user.degree === '관리자') return true;
      return false;
  }

  #hasUserInBoard(tag)
  {
    if(this.#isManager()) return true;
    const result = globalThis.boardInfoList.filter(board=>{
      if(board.tag === tag)
      {
        if(board.user && board.user.includes(globalThis.user._id)) return board;
      }
    })
    
    if(result && result.length) return true;
    else return false;
  }

  

  #makeMenu(board)
  {
    const li = document.createElement('li')
    li.classList.add("nav-item");
    li.innerHTML = `
      <a href="#" class="command-show-board" data-tag="${board.tag}" 
      data-name="${board.name}" data-id="${board._id}">
        <i class="fas fa-clipboard"></i>
        <p>${board.name}</p>
      </a>
    `
    return li;
  }

  #showBasicBoard()
  {
    globalThis.boardInfoList.forEach(board => {
      if(this.#hasUserInBoard(board.tag))
      {
        this.querySelector(`li.${board.tag}`)?.classList.remove('hidden')
      }
    });
  }

  #appendCustomerBoard()
  {
    this.querySelector('ul.custom-board').innerHTML = '';
    globalThis.boardInfoList.forEach(board => {
      if(board.type !== 'custom') return;
      if(board.tag === 'notice' || this.#isManager() || (board.user && board.user.includes(globalThis.user._id)))
      {
        this.querySelector('ul.custom-board').appendChild(this.#makeMenu(board))
      }
    });
  }

  #removeManagerMenu()
  {
    this.querySelector('ul.manage-menu')?.remove();
  }

  #changeTableContents(collection)
  {
    const _list = new TableList(globalThis.config[collection]);
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(_list);
  }

  #showCustomBoard(node)
  {
    const info = (node.dataset.tag === 'notice')? globalThis.config["notice"] : globalThis.config["board"]
    info.boardId = node.dataset.id;
    info.title = node.dataset.name;
    info.tag = node.dataset.tag;
    const formData = new FormData();
    formData.append("boardId", info.boardId);
    info.formData = formData;
    //const _list = new TableList(info);
    document.querySelector('.page-inner').innerHTML = '';
    //document.querySelector('.page-inner').appendChild(new CustomBoard(info));
    document.querySelector('.page-inner').appendChild(new TableList(info));
  }

  #showTagComponent(node)
  {
    const tagName = node.getAttribute('tag');
    const component = document.createElement(tagName);
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(component);
  }

  #showSheetList(node)
  {
    const _list = new SheetList(globalThis.config[node.getAttribute('tag')]);
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(_list);
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
          .logo-title{
            font-size: 24px;
            font-weight: bolder;  
            color:white;
          }
            @media screen and (max-width: 991.5px) {
              .logo-header .logo .logo-title {
                  display:none;
              }
          }
        </style>
        <div class="sidebar" data-background-color="dark">
        <div class="sidebar-logo">
          <div class="logo-header" data-background-color="dark">
            <a href="/crm/${globalThis.user.clientId}" class="logo">
              <span class="logo-title">Simple CRM</span>
            </a>
            <div class="nav-toggle">
              <button class="btn btn-toggle toggle-sidebar">
                <i class="gg-menu-right"></i>
              </button>
              <button class="btn btn-toggle sidenav-toggler">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <!--<button class="topbar-toggler more">
              <i class="gg-more-vertical-alt"></i>
            </button>-->
          </div>
        </div>
        <div class="sidebar-wrapper scrollbar scrollbar-inner">
          <div class="sidebar-content">
            <ul class="nav nav-secondary ">
                <li class="nav-section">
                  <span class="sidebar-mini-icon">
                    <i class="fa fa-ellipsis-h"></i>
                  </span>
                  <h4 class="text-section">영업</h4>
                </li>

                <li class="nav-item hidden calendar">
                  <a href="#" class="command-show-component" tag="calendar-board">
                    <i class="fas fa-calendar-check"></i>
                    <p>캘린더</p>
                  </a>
                </li>

                <li class="nav-item hidden sheet">
                  <a href="#" class="command-show-sheet-list" tag="sheet">
                    <i class="fas fa-briefcase"></i>
                    <p>영업기회</p>
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
                   <!--<span class="badge badge-secondary">1</span>-->
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

              <ul class="nav nav-collapse manage-menu">
                <li class="nav-section">
                <span class="sidebar-mini-icon">
                  <i class="fa fa-ellipsis-h"></i>
                </span>
                <h4 class="text-section">시스템</h4>
                </li>
                <li class="nav-item">
                  <a href="#" class="command-show-component" tag="contact-list">
                    <i class="fas fa-question-circle"></i>
                    <p>문의하기</p>
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


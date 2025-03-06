
class IndexHeader extends HTMLElement
{
  constructor()
  {
    super();
    this.addEventListener('click', this.handleClick);
    this.info = {};
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-user-logout/))
      {
        location.href = '/auth/logout'
        //this.#logout();
        return;
      }
      if(node.className.match(/command-show-password-form/))
      {
        this.#showPasswordForm();
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

  setData(info)
  {
    Object.assign(this.info, info);
    this.querySelector('span.user-name').innerText = this.info.name;
    this.querySelector('p.user-email').innerText = this.info.username;
  }

  #showPasswordForm()
  {
    const _tempInfo = {"tagName":'password-form', "info":this.info}
    const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
    window.postMessage(_message, location.href);
  }

  #logout()
  {
      const formData = new FormData();
      ttb.get_json_request("POST", "/api/crm/user/logoutUser.php", formData, (response)=>
      {
          if (100 == response.code)
          {
            location.href = '/user/logout'
            return;
          }
          else
          {
              if (response.message) alert(response.message, true);// message_box_side(response.message, 'red');//
              else console.dir(response); //message_box_side(response, 'red'); //*/
          }       
      });
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <header class="app-header">
  <nav class="navbar navbar-expand-lg navbar-light">
    <ul class="navbar-nav">
      <li class="nav-item d-block d-xl-none">
        <a class="nav-link sidebartoggler nav-icon-hover" id="headerCollapse" href="javascript:void(0)">
          <i class="ti ti-menu-2"></i>
        </a>
      </li>
    </ul>
    <div class="navbar-collapse justify-content-end px-0" id="navbarNav">
      <ul class="navbar-nav flex-row ms-auto align-items-center justify-content-end">
        <span class="user-name"></span>
        <li class="nav-item dropdown">
          <a class="nav-link nav-icon-hover" href="javascript:void(0)" id="drop2" data-bs-toggle="dropdown"
            aria-expanded="false">
            <img src="/img/profile/user-1.jpg" alt="" width="35" height="35" class="rounded-circle">
          </a>
          <div class="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop2">
            <div class="message-body">
              <a href="javascript:void(0)" class="d-flex align-items-center gap-2 dropdown-item">
                <i class="ti ti-mail fs-6"></i>
                <p class="user-email mb-0 fs-3"></p>
              </a>
              <button type="button" class="command-show-password-form btn btn-outline-primary mx-3 mt-2 d-block">비밀번호변경</button>
              <button type="button" class="command-user-logout btn btn-outline-dark mx-3 mt-2 d-block">Logout</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</header>
      `;  
      return tempalate;
  }
}
customElements.define("index-header", IndexHeader);


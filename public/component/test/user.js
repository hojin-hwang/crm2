export default class UserName  extends AbstractComponent{ // export 옆에 'default'를 추가해보았습니다.
  constructor(name) {
    super();   
		this.name = name;
  }
	getName()
	{
		return this.name;
	}
}
customElements.define('user-name', UserName);
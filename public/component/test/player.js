class Player {
	xPos; yPos; size;
	spot = {top:[0,0], bottom:[0,0], left:[0,0], right:[0,0]};
	color = "rgba(196, 126, 126, 0.9)"

	pImage;
	mImage;
	name;
	text;


	constructor(info ){
			Object.assign(this, info);
			
			this.height = 80;
			this.width = 200;
			this.imageSize = 80;
			this.canvas = document.querySelector('canvas')
			this.ctx = this.canvas.getContext('2d');
			this.parentPlayer = null;
			this.#setColor()
	}

	#setColor(){
		switch(this.step){
			case 20:
				this.color = "rgba(196, 126, 126, 0.9)";
				break;
			case 21:
				this.color = "rgba(126, 196, 126, 0.9)";
				break;
			case 22:
				this.color = "rgba(126, 126, 196, 0.9)";
				break;
			case 23:
				this.color = "rgba(196, 196, 126, 0.9)";
				break;
			default:
				this.color = "rgba(126, 196, 196, 0.9)";
				break;
		}
	}

	drawPlayerRect(){
			this.ctx.beginPath();
			this.ctx.fillStyle = this.color
			this.ctx.rect(this.xPos, this.yPos, this.width, this.height);
			this.ctx.fill();
			this.ctx.closePath();
			this.spot.top = [(this.xPos + this.width/2), this.yPos];
			this.spot.bottom = [(this.xPos + this.width /2), (this.yPos + this.height) ];
			this.spot.left = [(this.xPos), (this.yPos+ this.height/2)];
			this.spot.right = [(this.xPos + this.width), (this.yPos+ this.height/2)];
			
	}
	
	drawPlayerText(){
		this.ctx.font = "12px Arial";
		this.ctx.fillStyle = "black";
		const textWidth = this.ctx.measureText(this.name).width;

		this.ctx.fillText(this.step +` - ${this.number}`, this.xPos + this.imageSize+10, this.yPos + 15);

		this.ctx.fillText(this.birth, this.xPos + this.imageSize+10, this.yPos + 55);

		if(this.death){
			this.ctx.fillText(this.death, this.xPos + this.imageSize+10, this.yPos + 70);
		}

		this.ctx.font = "14px Arial";
		const names = (this.fullName) ? this.fullName : this.name;
		this.ctx.fillText(names , this.xPos + this.imageSize+10, this.yPos + 35);

	}

	drawLine(){
		if(!this.parentPlayer) return;

		this.ctx.beginPath();
    this.ctx.moveTo(this.parentPlayer.spot.right[0], this.parentPlayer.spot.right[1]);
		
		this.ctx.lineTo( (this.spot.left[0] + this.parentPlayer.spot.right[0]) /2, this.parentPlayer.spot.right[1]);
		this.ctx.lineTo((this.spot.left[0] + this.parentPlayer.spot.right[0]) /2, this.spot.left[1]);

    this.ctx.lineTo(this.spot.left[0], this.spot.left[1]);
    //this.ctx.closePath();
    this.ctx.stroke();
	}

	drawMarryLine(){
		if(!this.partnerPlayer) return;

		this.ctx.beginPath();
    this.ctx.moveTo(this.partnerPlayer.spot.bottom[0], this.partnerPlayer.spot.bottom[1]);
    this.ctx.lineTo(this.spot.top[0], this.spot.top[1]);
    //this.ctx.closePath();
    this.ctx.stroke();
	}

	setParent(parent){
		this.parentPlayer = parent;
	}

	setPartner(partner){
		this.partnerPlayer = partner;
	}

	drawImage(){
		if(this.pImage){
			const pImage = new Image();
			pImage.addEventListener("load", () => {
				this.ctx.drawImage(pImage, (this.spot.left[0]), (this.spot.left[1] - this.imageSize/2), this.imageSize, this.imageSize);
			});
			pImage.src = decodeURI(`/assets/test/images/${(this.pImage)}`);
		}
	}

	getData(){
		return {
			xPos: this.xPos,
			yPos: this.yPos,
			parent: this.parent,
			partner: this.partner,
			pImage: this.pImage,
			mImage: this.mImage,
			name: this.name,
			step: this.step,
			birth: this.birth,
			death: this.death,
			number: this.number
		}
	}
}

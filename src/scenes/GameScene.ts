import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
	player!: Phaser.Physics.Arcade.Sprite;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	bullets!: Phaser.Physics.Arcade.Group;

	constructor() {
		super({ key: 'GameScene' });
	}

	preload() {
		this.load.image('player', 'path_to_player_image.png');
		this.load.image('bullet', 'path_to_bullet_image.png');
	}

	create() {
		this.player = this.physics.add.sprite(400, 550, 'player');
		this.cursors = this.input.keyboard!.createCursorKeys();

		this.bullets = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Sprite,
		});

		// 탄막 생성
		this.time.addEvent({
			delay: 500,
			callback: this.shootBullet,
			callbackScope: this,
			loop: true,
		});
	}

	update() {
		// 플레이어 움직임
		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-150);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(150);
		} else {
			this.player.setVelocityX(0);
		}

		// 총알이 화면 밖으로 나가면 제거
		this.bullets.children.each((gameObject: Phaser.GameObjects.GameObject) => {
			let bullet = gameObject as Phaser.Physics.Arcade.Sprite;
			if (bullet.y < 0) {
				bullet.destroy();
			}
			return true;
		});
	}

	shootBullet() {
		const bullet = this.bullets.create(400, 0, 'bullet');
		bullet.setVelocityY(200);
	}
}

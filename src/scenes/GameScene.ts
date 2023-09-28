import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
	player!: Phaser.Physics.Arcade.Sprite;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	bullets!: Phaser.Physics.Arcade.Group;
	enemies!: Phaser.Physics.Arcade.Group;
	infoText!: Phaser.GameObjects.Text;

	playerVelocityX: number = 0;
	playerVelocityY: number = 0;

	MAX_SPEED: number = 300; // 플레이어의 최대 속도
	ACCELERATION: number = 15; // 가속도 값

	backgrounds: Phaser.GameObjects.TileSprite[][] = [];

	playerHp: number = 10;
	elapsedTime: number = 0;

	enemyBaseDamage: number = 1;
	enemyBaseHp: number = 2;
	enemyKilled: number = 0;

	constructor() {
		super({ key: 'GameScene' });
	}

	resetGame() {
		// player 상태 초기화
		this.playerVelocityX = 0;
		this.playerVelocityY = 0;
		this.player.setPosition(
			this.game.scale.width / 2,
			this.game.scale.height / 2
		);
		// player의 HP 초기화는 player 객체에 setData를 사용하여 설정하는 것으로 가정합니다.
		this.player.setData('hp', 10);
		this.playerHp = this.player.getData('hp');

		this.elapsedTime = 0;
		this.enemyKilled = 0;
	}

	preload() {
		// this.load.image('player', 'path_to_player_image.png');
		this.load.image('bullet', 'path_to_bullet_image.png');
		this.load.image('enemy', 'path_to_enemy_image.png');
		this.load.image('background', '/source/seamlessImage.png');

		const graphics = this.add.graphics();
		graphics.fillStyle(0xffffff); // 원의 색상 설정 (여기서는 흰색으로 설정)
		graphics.fillCircle(25, 25, 25); // 원 그리기 (반지름 25)
		graphics.generateTexture('playerTexture', 50, 50); // 그래픽을 텍스처로 저장
		graphics.destroy();
	}

	create() {
		const gameWidth = this.game.scale.width;
		const gameHeight = this.game.scale.height;

		// 3x3 그리드 배경 초기화
		const backgroundImage = this.textures.get('background').getSourceImage();
		const originalWidth = backgroundImage.width;
		const originalHeight = backgroundImage.height;
		for (let i = 0; i < 3; i++) {
			this.backgrounds[i] = [];
			for (let j = 0; j < 3; j++) {
				this.backgrounds[i][j] = this.add.tileSprite(
					(i - 1) * originalWidth,
					(j - 1) * originalHeight,
					originalWidth,
					originalHeight,
					'background'
				);
			}
		}

		this.player = this.physics.add.sprite(
			gameWidth / 2,
			gameHeight / 2,
			'playerTexture'
		);
		this.cursors = this.input.keyboard!.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
			space: Phaser.Input.Keyboard.KeyCodes.SPACE,
			shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
		}) as Phaser.Types.Input.Keyboard.CursorKeys;

		this.bullets = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Sprite,
		});

		this.enemies = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Sprite,
		});

		this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
			const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
			const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

			bulletSprite.destroy();

			let enemyHp = enemySprite.getData('hp');
			enemyHp--;

			if (enemyHp <= 0) {
				this.enemyKilled++;
				enemySprite.destroy();
			} else {
				enemySprite.setData('hp', enemyHp);
			}
		});

		this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
			const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

			this.playerHp -= this.enemyBaseDamage;
			console.log(`Player HP: ${this.playerHp}`); // 체력 상태를 콘솔에 출력

			let enemyHp = enemySprite.getData('hp');
			enemyHp--;

			if (enemyHp <= 0) {
				this.enemyKilled++;
				enemySprite.destroy();
			} else {
				enemySprite.setData('hp', enemyHp);

				// 적을 반대 방향으로 튕김
				const bounceAngle = Phaser.Math.Angle.Between(
					this.player.x,
					this.player.y,
					enemySprite.x,
					enemySprite.y
				);
				enemySprite.setVelocity(
					300 * Math.cos(bounceAngle),
					300 * Math.sin(bounceAngle)
				);
			}

			if (this.playerHp <= 0) {
				console.log('Player died');
				// 플레이어 사망 처리 로직
				// 플레이어가 사망했을 때 스코어 보드 씬으로 전환
				this.scene.start('ScoreboardScene', {
					elapsedTime: this.elapsedTime,
					enemiesKilled: this.enemyKilled,
				});
			}
		});

		// 적 생성 로직 (예: 일정 시간 간격으로 화면 사방에서 생성)
		this.time.addEvent({
			delay: Phaser.Math.Clamp(300 - this.elapsedTime, 50, 300),
			callback: this.spawnEnemyAtBorders,
			callbackScope: this,
			loop: true,
		});

		// 자동으로 총알 발사 설정
		this.time.addEvent({
			delay: 500,
			callback: this.shootBulletToClosestEnemy,
			callbackScope: this,
			loop: true,
		});

		// 게임 상태 표시
		this.infoText = this.add.text(this.game.scale.width - 10, 10, '', {
			fontSize: '16px',
			color: '#ffffff',
			align: 'left',
		});
		this.infoText.setOrigin(1, 0); // 우측 상단에 정렬하기 위해 origin 설정
	}

	update(time: number, delta: number) {
		const deltaInSeconds = delta / 1000;
		const gameWidth = this.game.scale.width;
		const gameHeight = this.game.scale.height;

		this.elapsedTime += delta / 1000; // ms를 초로 변환

		// 화면 밖 허용되는 거리
		const maxAllowedDistance = Math.sqrt(
			this.game.scale.width * this.game.scale.width +
				this.game.scale.height * this.game.scale.height
		);

		// 플레이어의 움직임에 따른 속도 조정
		if (this.cursors.left.isDown) {
			this.playerVelocityX = Phaser.Math.Clamp(
				this.playerVelocityX - this.ACCELERATION,
				-this.MAX_SPEED,
				this.MAX_SPEED
			);
		} else if (this.cursors.right.isDown) {
			this.playerVelocityX = Phaser.Math.Clamp(
				this.playerVelocityX + this.ACCELERATION,
				-this.MAX_SPEED,
				this.MAX_SPEED
			);
		} else {
			// 속도를 천천히 0으로 감소시키기
			this.playerVelocityX -=
				this.ACCELERATION *
				10 *
				Math.sign(this.playerVelocityX) *
				deltaInSeconds;
		}

		if (this.cursors.up.isDown) {
			this.playerVelocityY = Phaser.Math.Clamp(
				this.playerVelocityY - this.ACCELERATION,
				-this.MAX_SPEED,
				this.MAX_SPEED
			);
		} else if (this.cursors.down.isDown) {
			this.playerVelocityY = Phaser.Math.Clamp(
				this.playerVelocityY + this.ACCELERATION,
				-this.MAX_SPEED,
				this.MAX_SPEED
			);
		} else {
			// 속도를 천천히 0으로 감소시키기
			this.playerVelocityY -=
				this.ACCELERATION *
				10 *
				Math.sign(this.playerVelocityY) *
				deltaInSeconds;
		}

		// 배경 이동
		const backgroundImage = this.textures.get('background').getSourceImage();
		const originalWidth = backgroundImage.width;
		const originalHeight = backgroundImage.height;

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				this.backgrounds[i][j].x -= this.playerVelocityX * deltaInSeconds;
				this.backgrounds[i][j].y -= this.playerVelocityY * deltaInSeconds;

				// 배경 재배치: x축
				if (this.backgrounds[i][j].x < -originalWidth) {
					this.backgrounds[i][j].x += 3 * originalWidth;
				} else if (this.backgrounds[i][j].x > 2 * originalWidth) {
					this.backgrounds[i][j].x -= 3 * originalWidth;
				}

				// 배경 재배치: y축
				if (this.backgrounds[i][j].y < -originalHeight) {
					this.backgrounds[i][j].y += 3 * originalHeight;
				} else if (this.backgrounds[i][j].y > 2 * originalHeight) {
					this.backgrounds[i][j].y -= 3 * originalHeight;
				}
			}
		}

		// 모든 적과 총알에 대해 playerVelocityX, playerVelocityY 값을 반영하여 이동시킴
		this.enemies.children.each((gameObject: Phaser.GameObjects.GameObject) => {
			const enemy = gameObject as Phaser.Physics.Arcade.Sprite;
			const distanceToPlayer = Phaser.Math.Distance.Between(
				this.player.x,
				this.player.y,
				enemy.x,
				enemy.y
			);
			enemy.x -= this.playerVelocityX * deltaInSeconds;
			enemy.y -= this.playerVelocityY * deltaInSeconds;

			if (distanceToPlayer > maxAllowedDistance) {
				console.log('respawn!');
				enemy.destroy();
				this.spawnEnemyAtBorders();
			}

			return true;
		});

		this.bullets.children.each((gameObject: Phaser.GameObjects.GameObject) => {
			const bullet = gameObject as Phaser.Physics.Arcade.Sprite;
			bullet.x -= this.playerVelocityX * deltaInSeconds;
			bullet.y -= this.playerVelocityY * deltaInSeconds;
			return true;
		});

		// 총알이 화면 밖으로 나가면 제거
		this.bullets.children.each((gameObject: Phaser.GameObjects.GameObject) => {
			let bullet = gameObject as Phaser.Physics.Arcade.Sprite;

			if (
				bullet.x < 0 ||
				bullet.x > gameWidth ||
				bullet.y < 0 ||
				bullet.y > gameHeight
			) {
				bullet.destroy();
			}

			return true;
		});

		const enemyCount = this.enemies.countActive(true);
		const infoString = `
Elapsed Time: ${this.elapsedTime.toFixed(2)}s
Enemies Killed: ${this.enemyKilled}
Enemies Alive: ${enemyCount}
`;
		this.infoText.setText(infoString);
	}

	shootBullet() {
		// 화면의 사방 중 하나를 랜덤하게 선택
		const side = Math.floor(Math.random() * 4);

		const gameWidth = this.game.scale.width;
		const gameHeight = this.game.scale.height;

		let x = 0,
			y = 0;

		switch (side) {
			case 0: // 위
				x = Math.random() * gameWidth;
				y = 0;
				break;
			case 1: // 오른쪽
				x = gameWidth;
				y = Math.random() * gameHeight;
				break;
			case 2: // 아래
				x = Math.random() * gameWidth;
				y = gameHeight;
				break;
			case 3: // 왼쪽
				x = 0;
				y = Math.random() * gameHeight;
				break;
		}

		const bullet = this.bullets.create(x, y, 'bullet');

		// 총알 크기를 절반으로 줄이기
		bullet.setScale(0.5);

		// 플레이어 중심으로 특정 원 안의 영역을 타겟으로 하는 위치 계산
		const randomRadius = Math.random() * 100 + 50; // 예: 50~150의 반경
		const randomAngle = Math.random() * (2 * Math.PI);

		const targetX = this.player.x + randomRadius * Math.cos(randomAngle);
		const targetY = this.player.y + randomRadius * Math.sin(randomAngle);

		// 탄막을 타겟 방향으로 발사
		const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
		const speed = 200; // 탄막의 속도
		bullet.setVelocityX(speed * Math.cos(angle));
		bullet.setVelocityY(speed * Math.sin(angle));
	}

	spawnEnemyAtBorders() {
		const side = Math.floor(Math.random() * 4);
		const gameWidth = this.game.scale.width;
		const gameHeight = this.game.scale.height;

		let x = 0,
			y = 0;

		switch (side) {
			case 0: // 위
				x = Math.random() * gameWidth;
				y = 0;
				break;
			case 1: // 오른쪽
				x = gameWidth;
				y = Math.random() * gameHeight;
				break;
			case 2: // 아래
				x = Math.random() * gameWidth;
				y = gameHeight;
				break;
			case 3: // 왼쪽
				x = 0;
				y = Math.random() * gameHeight;
				break;
		}

		const enemy = this.enemies.create(x, y, 'enemy');
		enemy.setData('hp', 2 + Math.floor(this.elapsedTime / 20)); // 적의 HP 설정. 필요에 따라 변경 가능

		const radius =
			(1 / 3) *
			Math.sqrt(
				this.game.scale.width * this.game.scale.width +
					this.game.scale.height * this.game.scale.height
			);
		const randomRadius = Math.random() * radius;
		const randomAngle = Math.random() * (2 * Math.PI);

		const targetX = this.player.x + randomRadius * Math.cos(randomAngle);
		const targetY = this.player.y + randomRadius * Math.sin(randomAngle);

		const angleToPlayer = Phaser.Math.Angle.Between(x, y, targetX, targetY);

		const speed = 100 + this.elapsedTime * 2; // 적의 속도. 이 값을 조절하여 원하는 속도로 설정할 수 있습니다.
		enemy.setVelocity(
			speed * Math.cos(angleToPlayer),
			speed * Math.sin(angleToPlayer)
		);
	}

	shootBulletToClosestEnemy() {
		let closestEnemy: Phaser.Physics.Arcade.Sprite | null = null;
		let closestDistance = Infinity;

		this.enemies.children.each((gameObject: Phaser.GameObjects.GameObject) => {
			const enemy = gameObject as Phaser.Physics.Arcade.Sprite;
			const distance = Phaser.Math.Distance.Between(
				this.player.x,
				this.player.y,
				enemy.x,
				enemy.y
			);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestEnemy = enemy;
			}

			return true;
		});

		if (closestEnemy) {
			const enemySprite = closestEnemy as Phaser.Physics.Arcade.Sprite;
			const angle = Phaser.Math.Angle.Between(
				this.player.x,
				this.player.y,
				enemySprite.x,
				enemySprite.y
			);
			const bullet = this.bullets.create(
				this.player.x,
				this.player.y,
				'bullet'
			);
			const speed = 1000; // 총알의 속도를 설정합니다. 이 값을 조절하여 원하는 속도로 설정할 수 있습니다.
			bullet.setVelocity(speed * Math.cos(angle), speed * Math.sin(angle));
		}
	}
}

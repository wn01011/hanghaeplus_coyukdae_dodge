import GameScene from './GameScene';

export default class ScoreboardScene extends Phaser.Scene {
	constructor() {
		super({ key: 'ScoreboardScene' });
	}

	create(data: { elapsedTime: number; enemiesKilled: number }) {
		this.add.text(
			100,
			100,
			`Survival Time: ${data.elapsedTime.toFixed(2)} seconds`,
			{ color: '#fff' }
		);
		this.add.text(100, 130, `Enemies Killed: ${data.enemiesKilled}`, {
			color: '#fff',
		});

		// 재시작 버튼
		const restartButton = this.add.text(100, 200, '재시작', {
			color: '#fff',
			backgroundColor: '#333',
			padding: { left: 15, right: 15, top: 10, bottom: 10 },
		});
		restartButton.setInteractive();
		restartButton.on('pointerdown', () => {
			const gameScene = this.scene.get('GameScene') as GameScene;
			gameScene.resetGame();
			this.scene.start('GameScene');
		});

		// 홈으로 버튼
		const homeButton = this.add.text(100, 250, '홈으로', {
			color: '#fff',
			backgroundColor: '#333',
			padding: { left: 15, right: 15, top: 10, bottom: 10 },
		});
		homeButton.setInteractive();
		homeButton.on('pointerdown', () => {
			this.scene.start('MenuScene');
		});
	}
}

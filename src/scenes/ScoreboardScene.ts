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

		// 다른 UI 요소 및 로직 추가...
	}
}

export default class ChooseModeScene extends Phaser.Scene {
	constructor() {
		super({ key: 'ChooseModeScene' });
	}

	create() {
		const singleModeButton = this.add
			.text(this.scale.width / 2, this.scale.height / 2 - 50, '싱글 모드', {
				color: '#fff',
			})
			.setOrigin(0.5)
			.setInteractive();

		const multiModeButton = this.add
			.text(this.scale.width / 2, this.scale.height / 2 + 50, '멀티 모드', {
				color: '#fff',
			})
			.setOrigin(0.5)
			.setInteractive();

		singleModeButton.on('pointerdown', () => {
			this.scene.start('GameScene'); // 싱글 모드 게임 시작
		});

		// 멀티 모드의 경우 별도의 구현이 필요하므로 아래 코드는 예시로만 제공됩니다.
		multiModeButton.on('pointerdown', () => {
			// this.scene.start('MultiModeScene');
		});
	}
}

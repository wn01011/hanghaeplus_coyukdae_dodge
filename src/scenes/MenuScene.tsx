export default class MenuScene extends Phaser.Scene {
	constructor() {
		super({ key: 'MenuScene' });
	}

	create() {
		const centerX = this.scale.width / 2;
		const centerY = this.scale.height / 2;
		// 게임 시작 버튼
		const startButton = this.add
			.text(centerX * 1.5, centerY * 1.2, 'Start Game', { color: '#fff' })
			.setInteractive();
		startButton.on('pointerdown', () => {
			// 게임 씬 시작 로직
			this.scene.start('ChooseModeScene');
		});

		// 옵션창 열기 버튼
		const optionButton = this.add
			.text(centerX * 1.5, centerY * 1.2 + 50, 'Options', { color: '#fff' })
			.setInteractive();
		optionButton.on('pointerdown', () => {
			this.scene.switch('OptionScene');
		});
	}
}

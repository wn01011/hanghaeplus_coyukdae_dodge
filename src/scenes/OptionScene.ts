export default class OptionScene extends Phaser.Scene {
	bgmVolume: number;
	volumeText: Phaser.GameObjects.Text | null = null;
	volumeFill!: Phaser.GameObjects.Rectangle; // 볼륨 채우기를 위한 사각형 추가

	constructor() {
		super({ key: 'OptionScene' });

		this.bgmVolume = 0.5; // 초기 볼륨 값을 0.5로 설정
	}

	create() {
		this.volumeText = this.add.text(10, 10, 'BGM Volume: 50%', {
			color: '#fff',
		});
		// 슬라이더 추가 (간단한 사각형을 사용하여 구현)
		const slider = this.add.rectangle(10, 50, 300, 20, 0x666666).setOrigin(0);

		this.volumeFill = this.add
			.rectangle(10, 50, this.bgmVolume * 300, 20, 0x00ff00)
			.setOrigin(0);

		const initialSliderButtonX = 10 + this.bgmVolume * 300; // 초기 슬라이더 버튼의 x 위치 계산

		const sliderButton = this.add
			.rectangle(initialSliderButtonX, 50, 20, 20, 0xffffff)
			.setOrigin(0)
			.setInteractive();

		// 드래그 이벤트 추가
		sliderButton.on('drag', (pointer: Phaser.Input.Pointer, x: number) => {
			x = Phaser.Math.Clamp(x, 10, 310); // 슬라이더 범위 제한
			sliderButton.x = x;
			this.bgmVolume = (x - 10) / 300; // 볼륨 값 갱신

			this.volumeFill.width = this.bgmVolume * 300; // 볼륨 채우기 사각형의 너비 갱신

			if (this.volumeText) {
				this.volumeText.setText(
					'BGM Volume: ' + Math.round(this.bgmVolume * 100) + '%'
				);
			}
			// 전체 볼륨 일괄 조정
			this.game.sound.volume = this.bgmVolume;
		});

		this.input.setDraggable(sliderButton);

		// 닫기 버튼 추가
		const closeButton = this.add
			.text(10, 100, 'Close', { color: '#fff' })
			.setInteractive();
		closeButton.on('pointerdown', () => {
			this.scene.switch('MenuScene');
		});
	}
}

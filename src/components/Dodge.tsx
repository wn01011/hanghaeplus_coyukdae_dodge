import React, { useEffect } from 'react';
import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';

const Dodge: React.FC = () => {
	useEffect(() => {
		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: 800,
			height: 600,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 },
					debug: false,
				},
			},
			scene: [GameScene],
		};

		const game = new Phaser.Game(config);
		return () => {
			game.destroy(true);
		};
	}, []);

	return <div id='phaser-game' />;
};

export default Dodge;

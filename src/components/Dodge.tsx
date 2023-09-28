// Dodge.tsx

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';
import ChooseModeScene from '../scenes/ChooseModeScene';
import MenuScene from '../scenes/MenuScene';
import OptionScene from '../scenes/OptionScene';
import ScoreboardScene from '../scenes/ScoreboardScene';

const Dodge: React.FC = () => {
	const gameRef = useRef<Phaser.Game | null>(null);

	useEffect(() => {
		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: window.innerWidth,
			height: window.innerHeight,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 },
					debug: false,
				},
			},
			scene: [
				MenuScene,
				ChooseModeScene,
				GameScene,
				OptionScene,
				ScoreboardScene,
			],
		};

		gameRef.current = new Phaser.Game(config);

		const resizeHandler = () => {
			if (gameRef.current) {
				gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
			}
		};

		window.addEventListener('resize', resizeHandler);

		return () => {
			window.removeEventListener('resize', resizeHandler);
			if (gameRef.current) {
				gameRef.current.destroy(true);
				gameRef.current = null;
			}
		};
	}, []);

	return <div id='game-container'></div>;
};

export default Dodge;

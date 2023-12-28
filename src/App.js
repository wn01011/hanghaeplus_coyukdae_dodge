// App.js
import React, { useEffect, useRef, useState } from 'react';
import * as S from './App.style';
import snowflakeStore from './Snowflake';

const App = () => {
	const [, setRender] = useState(true);

	useEffect(() => {
		window.addEventListener('resize', () => {});

		const updateSnowflakes = () => {
			snowflakeStore.updateSnowflakes();
			// handleSnowflakeInteractions();
			setRender((prev) => !prev);
			setTimeout(updateSnowflakes, 1000 / 60);
		};

		updateSnowflakes();
	}, []);

	return (
		<S.Container>
			{snowflakeStore.snowflakes.map((snowflake, index) => (
				<S.Flake
					key={index}
					style={{
						top: snowflake.y,
						left: snowflake.x,
						width: snowflake.size + 'px',
						height: snowflake.size + 'px',
					}}
				/>
			))}
			<S.WindButton onClick={() => snowflakeStore.setWind()}>
				바람 세기
			</S.WindButton>
			<S.GravityButton onClick={() => snowflakeStore.setGravity()}>
				중력 세기
			</S.GravityButton>
		</S.Container>
	);
};

export default App;

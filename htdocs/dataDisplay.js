

export function toggleLED(state){
	for(let i = 1; i < 4; i++){
		document.getElementById(`sensor_${i}` ).classList.toggle(state);
	}
};
export function toggleFetchSuccess(PROTOCOL){            
	document.getElementById(`operator_${PROTOCOL}`).classList.add(`${PROTOCOL}_ON`);
	document.getElementById(`operator_${PROTOCOL}`).classList.remove(`${PROTOCOL}_OFF`);
	document.getElementById(`${PROTOCOL}_state`).style.color = "#26C755";
	document.getElementById(`${PROTOCOL}_state`).innerHTML   = "Online" ;
}
export function toggleFetchError(PROTOCOL){
	document.getElementById(`operator_${PROTOCOL}`).classList.add(`${PROTOCOL}_OFF`);
	document.getElementById(`operator_${PROTOCOL}`).classList.remove(`${PROTOCOL}_ON`);
	document.getElementById(`${PROTOCOL}_state`).style.color = "red";
	document.getElementById(`${PROTOCOL}_state`).innerHTML   = "offline" ;
}
export function toggleRefresh(button) {
	sounds.switchAudio.play();                     
	const PROTOCOL = button.id.split("_")[1];
	sounds[PROTOCOL].habilitado = !sounds[PROTOCOL].habilitado;
	button.classList.toggle('ON'); 
	document.getElementById(`${PROTOCOL}_sound`).classList.toggle('sound_on');                                                                                                        
}
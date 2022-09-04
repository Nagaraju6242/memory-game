const totalPokemons = 1154;
const n = 8;
var lastPokemon = "";
var lastCard = null;
var correctCount = 0;

var confettiSettings = {
	target: "my-confetti",
	max: "200",
	size: "1",
	animate: true,
	props: ["circle", "square", "triangle", "line"],
	colors: [
		[165, 104, 246],
		[230, 61, 135],
		[0, 199, 228],
		[253, 214, 126],
	],
	clock: "25",
	rotate: true,
	width: window.innerWidth,
	height: window.innerHeight,
	start_from_edge: true,
	respawn: false,
};

function randomHSL() {
	return `hsla(${~~(360 * Math.random())},90%,60%,1)`;
}

async function getPokemonNames(n) {
	var offSet = Math.floor(Math.random() * (totalPokemons - (n + 10)));
	var limit = n;
	var url = `https://pokeapi.co/api/v2/pokemon/?offset=${offSet}&limit=${limit}`;

	// console.log(url);
	var response = await fetch(url);
	var data = await response.json();
	pokemons = data["results"].map((pokemon) => pokemon["name"]);
	return pokemons;
}

async function getPokemonsData(n) {
	var pokemons = await getPokemonNames(n);
	var baseUrl = "https://pokeapi.co/api/v2/pokemon/";
	var promises = [];
	for (var i = 0; i < pokemons.length; i++) {
		var url = baseUrl + pokemons[i];
		promises.push(fetch(url));
	}
	responses = await Promise.all(promises);
	var data = await Promise.all(responses.map((response) => response.json()));
	return data.map((pokemon) => {
		return { name: pokemon.name, sprite: pokemon.sprites.front_default };
	});
}

const shuffleArr = (arr) => {
	var length = arr.length;
	for (i = 0; i < length; i++) {
		arr.push(arr[i]);
	}

	for (var i = arr.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
};

const startOrReset = () => {
	$(".reset-button").text("Reset Game");
	$(".reset-button").removeClass("start");
	$(".loading").fadeIn();
	correctCount = 0;
	$(".canvas-holder").hide();
	getPokemonsData(n).then((data) => {
		console.log(data);
		var modifiedData = shuffleArr(data);
		$(".card:not(.hidden)").remove();
		for (var i = 0; i < modifiedData.length; i++) {
			var card = $(".card.hidden").clone();
			card.removeClass("hidden");
			card.find(".poke-title").text(data[i].name);
			card.find(".poke-img").attr("src", data[i].sprite);
			card.attr("data-pokemon", data[i].name);
			card.click(cardClicked);
			card.appendTo(".cards");
		}
		$(".loading").fadeOut();
	});
};

const wonGame = () => {
	$(".canvas-holder").show();
	var confetti = new ConfettiGenerator(confettiSettings);
	confetti.render();
	$(".reset-button").text("Start New Game");
	$(".reset-button").addClass("start");
};

const cardClicked = (e) => {
	var card = $(e.currentTarget);
	if (card.hasClass("turned")) {
		return;
	}
	card.addClass("rotated");
	card.addClass("turned");
	var pokemon = card.attr("data-pokemon");
	if (lastPokemon == "") {
		lastPokemon = pokemon;
		lastCard = card;
		return;
	}
	if (pokemon == lastPokemon) {
		lastPokemon = "";
		correctCount++;
		if (correctCount == n) {
			wonGame();
		}
		return;
	} else {
		lastPokemon = "";
		setTimeout(
			(card, lastCard) => {
				card.removeClass("rotated");
				lastCard.removeClass("rotated");
				card.removeClass("turned");
				lastCard.removeClass("turned");
			},
			1000,
			card,
			lastCard
		);
	}
};

startOrReset();
// setInterval(() => {
// 	$("body").css("background-color", randomHSL());
// }, 10000);

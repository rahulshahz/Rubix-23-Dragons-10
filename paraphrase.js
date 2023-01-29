const data = JSON.stringify({
	"language": "en",
	"strength": 3,
	"text": "lets do this"
});

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
	}
});

xhr.open("POST", "https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/rewrite");
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("X-RapidAPI-Key", "e41dedd1f2msh86c354bc140a33fp11779cjsn49f416258ead");
xhr.setRequestHeader("X-RapidAPI-Host", "rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com");

xhr.send(data);